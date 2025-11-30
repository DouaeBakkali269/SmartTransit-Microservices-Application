'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface DriverNavigationMapProps {
    driverLocation: [number, number];
    nextStation: {
        name: string;
        coordinates: [number, number];
    };
}

export function DriverNavigationMap({ driverLocation, nextStation }: DriverNavigationMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const layersRef = useRef<L.Layer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current, {
            zoomControl: false, // We'll add custom controls if needed, or keep it clean
            attributionControl: false,
        }).setView(driverLocation, 16); // High zoom for navigation feel

        // Dark mode or high contrast map might look cool for drivers, but let's stick to clean light for now
        // or maybe a "navigation" style map if available. Carto Light is good.
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
        });

        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;
        mapInstanceRef.current = map;

        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => {
            if (tileLayerRef.current) {
                tileLayerRef.current.remove();
                tileLayerRef.current = null;
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update map with new location/route
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        let isMounted = true;
        setIsLoading(true);

        // Clear previous layers
        layersRef.current.forEach(layer => {
            if (map.hasLayer(layer)) map.removeLayer(layer);
        });
        layersRef.current = [];

        const addLayer = (layer: L.Layer) => {
            if (isMounted && map) {
                layer.addTo(map);
                layersRef.current.push(layer);
            }
        };

        // 1. Add Driver Marker (Bus Icon)
        const busIcon = L.divIcon({
            className: 'bus-marker',
            html: `
                <div style="
                    background-color: #2563eb;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 4px solid white;
                    box-shadow: 0 4px 10px rgba(37, 99, 235, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
                </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
        });

        const driverMarker = L.marker(driverLocation, { icon: busIcon, zIndexOffset: 1000 });
        addLayer(driverMarker);

        // 2. Add Destination Marker
        const destIcon = L.divIcon({
            className: 'dest-marker',
            html: `
                <div style="
                    background-color: #ef4444;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">
                    <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
                </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });

        const destMarker = L.marker(nextStation.coordinates, { icon: destIcon });
        destMarker.bindPopup(`<b>Next Stop:</b> ${nextStation.name}`).openPopup();
        addLayer(destMarker);

        // 3. Fetch and Draw Route
        const fetchRoute = async () => {
            try {
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${driverLocation[1]},${driverLocation[0]};${nextStation.coordinates[1]},${nextStation.coordinates[0]}?overview=full&geometries=geojson`
                );
                const data = await response.json();

                if (!isMounted) return;

                if (data.routes && data.routes.length > 0) {
                    const routeCoords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

                    // Draw route
                    const routeLine = L.polyline(routeCoords, {
                        color: '#3b82f6',
                        weight: 8,
                        opacity: 0.8,
                        lineCap: 'round',
                        lineJoin: 'round'
                    });
                    addLayer(routeLine);

                    // Fit bounds to show both driver and next station, but biased towards driver?
                    // Actually user requested "zoomed in on the drivers position".
                    // So let's just pan to driver.
                    map.panTo(driverLocation, { animate: true, duration: 1 });
                } else {
                    // Fallback line
                    addLayer(L.polyline([driverLocation, nextStation.coordinates], { color: '#3b82f6', weight: 6, opacity: 0.6 }));
                }

            } catch (error) {
                console.error("Failed to fetch route", error);
                if (isMounted) {
                    addLayer(L.polyline([driverLocation, nextStation.coordinates], { color: '#3b82f6', weight: 6, opacity: 0.6 }));
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchRoute();

        return () => {
            isMounted = false;
        };

    }, [driverLocation, nextStation]);

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-inner bg-slate-100">
            <div ref={mapRef} className="w-full h-full" />

            {/* Overlay Info */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-white/20 z-[400]">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Next Station</p>
                        <h3 className="text-lg font-bold text-slate-900">{nextStation.name}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Distance</p>
                        <h3 className="text-lg font-bold text-blue-600">1.2 km</h3>
                    </div>
                </div>
            </div>
        </div>
    );
}
