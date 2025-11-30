'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface TripMapProps {
    userLocation: [number, number];
    startStation: [number, number];
    endStation: [number, number];
    startName: string;
    endName: string;
}

export function TripMap({ userLocation, startStation, endStation, startName, endName }: TripMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersRef = useRef<L.Layer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize map only once
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true,
        }).setView(startStation, 13);

        // Add tile layer and store reference
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            crossOrigin: true,
        });

        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;
        mapInstanceRef.current = map;

        // Force map to recalculate size after a short delay
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

    // Update route and markers when props change
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        let isMounted = true;
        setIsLoading(true);

        // Clear previous markers and routes
        markersRef.current.forEach(layer => {
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        });
        markersRef.current = [];

        const addLayer = (layer: L.Layer) => {
            if (isMounted && map) {
                layer.addTo(map);
                markersRef.current.push(layer);
            }
        };

        const fetchRoute = async () => {
            try {
                // OSRM API for driving route
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${startStation[1]},${startStation[0]};${endStation[1]},${endStation[0]}?overview=full&geometries=geojson`
                );
                const data = await response.json();

                if (!isMounted) return;

                let busRouteCoords: [number, number][] = [];

                if (data.routes && data.routes.length > 0) {
                    busRouteCoords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                } else {
                    busRouteCoords = [startStation, endStation];
                }

                // Create custom icon
                const createCustomIcon = (color: string, label: string) => {
                    return L.divIcon({
                        className: 'custom-marker',
                        html: `
                            <div style="
                                background-color: ${color};
                                width: 32px;
                                height: 32px;
                                border-radius: 50% 50% 50% 0;
                                transform: rotate(-45deg);
                                border: 3px solid white;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <span style="
                                    transform: rotate(45deg);
                                    color: white;
                                    font-weight: bold;
                                    font-size: 14px;
                                ">${label}</span>
                            </div>
                        `,
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                    });
                };

                // Add routes first (so they appear under markers)
                // Walking route: User -> Start
                addLayer(L.polyline([userLocation, startStation], {
                    color: '#3b82f6',
                    weight: 4,
                    opacity: 0.6,
                    dashArray: '10, 10',
                }));

                // Bus route: Start -> End
                addLayer(L.polyline(busRouteCoords, {
                    color: '#4f46e5',
                    weight: 5,
                    opacity: 0.9,
                }));

                // Add markers
                addLayer(L.marker(userLocation, {
                    icon: createCustomIcon('#3b82f6', '📍')
                }).bindPopup('<b>Your Location</b>'));

                addLayer(L.marker(startStation, {
                    icon: createCustomIcon('#4f46e5', 'S')
                }).bindPopup(`<b>Start: ${startName}</b>`));

                addLayer(L.marker(endStation, {
                    icon: createCustomIcon('#312e81', 'E')
                }).bindPopup(`<b>End: ${endName}</b>`));

                // Fit bounds to show all markers and route
                if (isMounted && map) {
                    const bounds = L.latLngBounds([userLocation, startStation, endStation]);
                    busRouteCoords.forEach(coord => bounds.extend(coord));

                    if (bounds.isValid()) {
                        map.fitBounds(bounds, { padding: [50, 50] });
                    }

                    // Force map refresh
                    setTimeout(() => {
                        map.invalidateSize();
                    }, 100);
                }

            } catch (error) {
                console.error("Failed to fetch route:", error);
                if (isMounted) {
                    // Fallback: straight line
                    addLayer(L.polyline([startStation, endStation], {
                        color: '#4f46e5',
                        weight: 5
                    }));
                }
            } finally {
                if (isMounted) {
                    setTimeout(() => {
                        setIsLoading(false);
                        // One more invalidateSize after loading completes
                        if (map) {
                            map.invalidateSize();
                        }
                    }, 500);
                }
            }
        };

        fetchRoute();

        return () => {
            isMounted = false;
        };

    }, [userLocation, startStation, endStation, startName, endName]);

    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-200 shadow-sm">
            <div
                ref={mapRef}
                className="w-full h-full"
                style={{ minHeight: '300px', background: '#f1f5f9' }}
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-blue-900 bg-white px-4 py-2 rounded-full shadow-sm">
                            Calculating Route...
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
