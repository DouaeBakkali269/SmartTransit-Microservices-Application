'use client';

import { useEffect, useRef } from 'react';
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

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current || stations.length === 0) return;

        // Initialize map centered on the first station
        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
        }).setView(stations[0].coordinates, 12);

        // Light tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Custom marker icons
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

        // Add markers and create path coordinates
        const pathCoords: [number, number][] = [];
        const markers: L.Marker[] = [];

        stations.forEach((station, index) => {
            pathCoords.push(station.coordinates);

            const isTerminal = index === 0 || index === stations.length - 1;
            const marker = L.marker(station.coordinates, {
                icon: createStationIcon(isTerminal, index)
            }).addTo(map);

            marker.bindPopup(`<b>${station.name}</b>${isTerminal ? (index === 0 ? '<br>Start' : '<br>End') : ''}`);
            markers.push(marker);
        });

        // Draw the line
        if (pathCoords.length > 1) {
            L.polyline(pathCoords, {
                color: lineColor,
                weight: 5,
                opacity: 0.8,
                lineJoin: 'round'
            }).addTo(map);
        }

        // Fit bounds
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [stations, lineColor]);

    // Update map when stations change
    useEffect(() => {
        if (!mapInstanceRef.current || stations.length === 0) return;

        const map = mapInstanceRef.current;

        // Clear existing layers (except tiles)
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                map.removeLayer(layer);
            }
        });

        // Re-add markers and line (logic duplicated for simplicity, could be refactored)
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

        const pathCoords: [number, number][] = [];
        const markers: L.Marker[] = [];

        stations.forEach((station, index) => {
            pathCoords.push(station.coordinates);

            const isTerminal = index === 0 || index === stations.length - 1;
            const marker = L.marker(station.coordinates, {
                icon: createStationIcon(isTerminal, index)
            }).addTo(map);

            marker.bindPopup(`<b>${station.name}</b>${isTerminal ? (index === 0 ? '<br>Start' : '<br>End') : ''}`);
            markers.push(marker);
        });

        if (pathCoords.length > 1) {
            L.polyline(pathCoords, {
                color: lineColor,
                weight: 5,
                opacity: 0.8,
                lineJoin: 'round'
            }).addTo(map);
        }

        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            map.fitBounds(group.getBounds(), { padding: [50, 50] });
        }

    }, [stations, lineColor]);

    return (
        <div
            ref={mapRef}
            className="w-full h-full rounded-lg overflow-hidden border-2 border-slate-200"
            style={{ minHeight: '300px' }}
        />
    );
}
