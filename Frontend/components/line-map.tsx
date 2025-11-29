'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LineMapProps {
    stations: {
        name: string;
        coordinates: [number, number];
    }[];
    lineColor?: string;
}

export function LineMap({ stations, lineColor = '#2563eb' }: LineMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersRef = useRef<L.Layer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize map only once
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current || stations.length === 0) return;

        // Initialize map centered on the first station
        const map = L.map(mapRef.current, {
            zoomControl: true,
            attributionControl: true,
        }).setView(stations[0].coordinates, 12);

        // Light tile layer
        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
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

    // Update map when stations change
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || stations.length === 0) return;

        let isMounted = true;
        setIsLoading(true);

        // Clear existing layers (except tiles)
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
                if (!isMounted) return;

                // Helper delay function
                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

                const segments: [number, number][][] = [];

                // Fetch segments sequentially to avoid rate limiting
                for (let i = 0; i < stations.length - 1; i++) {
                    if (!isMounted) return;

                    const start = stations[i];
                    const end = stations[i + 1];

                    try {
                        // Add a small delay between requests to be nice to the API
                        if (i > 0) await delay(300);

                        const response = await fetch(
                            `https://router.project-osrm.org/route/v1/driving/${start.coordinates[1]},${start.coordinates[0]};${end.coordinates[1]},${end.coordinates[0]}?overview=full&geometries=geojson`
                        );

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const text = await response.text();
                        try {
                            const data = JSON.parse(text);
                            if (data.routes && data.routes.length > 0) {
                                segments.push(data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]));
                            } else {
                                segments.push([start.coordinates, end.coordinates]);
                            }
                        } catch (e) {
                            console.warn(`Invalid JSON for segment ${i}:`, text.substring(0, 100));
                            segments.push([start.coordinates, end.coordinates]);
                        }
                    } catch (e) {
                        console.error(`Failed to fetch segment ${i}`, e);
                        segments.push([start.coordinates, end.coordinates]); // Fallback to straight line
                    }
                }

                if (!isMounted) return;

                // Combine all segments into one path
                const fullRouteCoords: [number, number][] = [];

                segments.forEach((segment, index) => {
                    // For all segments except the first, skip the first point (duplicate of previous segment's last point)
                    if (index > 0) {
                        fullRouteCoords.push(...segment.slice(1));
                    } else {
                        fullRouteCoords.push(...segment);
                    }
                });

                // Draw the route line
                if (fullRouteCoords.length > 1) {
                    addLayer(L.polyline(fullRouteCoords, {
                        color: lineColor,
                        weight: 5,
                        opacity: 0.8,
                        lineJoin: 'round'
                    }));
                }

                // Create markers
                const createStationIcon = (isTerminal: boolean, index: number) => {
                    const color = isTerminal ? (index === 0 ? '#2563eb' : '#ef4444') : '#64748b';
                    const size = isTerminal ? 24 : 16;

                    return L.divIcon({
                        className: 'station-marker',
                        html: `
                            <div style="
                                background-color: ${color};
                                width: ${size}px;
                                height: ${size}px;
                                border-radius: 50%;
                                border: 3px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            "></div>
                        `,
                        iconSize: [size, size],
                        iconAnchor: [size / 2, size / 2],
                    });
                };

                stations.forEach((station, index) => {
                    const isTerminal = index === 0 || index === stations.length - 1;
                    const marker = L.marker(station.coordinates, {
                        icon: createStationIcon(isTerminal, index)
                    });

                    marker.bindPopup(`<b>${station.name}</b>${isTerminal ? (index === 0 ? '<br>Start' : '<br>End') : ''}`);
                    addLayer(marker);
                });

                // Fit bounds
                if (isMounted && map) {
                    const bounds = L.latLngBounds(stations.map(s => s.coordinates));
                    // Also include route points in bounds
                    fullRouteCoords.forEach(c => bounds.extend(c));

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
                    // Fallback: straight lines connecting all stations
                    const coords = stations.map(s => s.coordinates);
                    addLayer(L.polyline(coords, {
                        color: lineColor,
                        weight: 5,
                        opacity: 0.8,
                        lineJoin: 'round'
                    }));
                }
            } finally {
                if (isMounted) {
                    setTimeout(() => {
                        setIsLoading(false);
                        if (map) map.invalidateSize();
                    }, 500);
                }
            }
        };

        fetchRoute();

        return () => {
            isMounted = false;
        };

    }, [stations, lineColor]);

    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-slate-200 shadow-sm">
            <div
                ref={mapRef}
                className="w-full h-full"
                style={{ minHeight: '300px', background: '#f8fafc' }}
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[1000] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-sm font-medium text-blue-900 bg-white px-4 py-2 rounded-full shadow-sm">
                            Loading Route...
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
