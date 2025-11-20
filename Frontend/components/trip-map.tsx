'use client';

import { useEffect, useRef } from 'react';
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

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
        }).setView(startStation, 12);

        // Black and white tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Custom marker icons
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

        // Add markers
        const userMarker = L.marker(userLocation, {
            icon: createCustomIcon('#3b82f6', '📍')
        }).addTo(map);
        userMarker.bindPopup('<b>Your Location</b>');

        const startMarker = L.marker(startStation, {
            icon: createCustomIcon('#7c3aed', 'S')
        }).addTo(map);
        startMarker.bindPopup(`<b>Start: ${startName}</b>`);

        const endMarker = L.marker(endStation, {
            icon: createCustomIcon('#dc2626', 'E')
        }).addTo(map);
        endMarker.bindPopup(`<b>End: ${endName}</b>`);

        // Add route from user location to start station (purple)
        L.polyline([userLocation, startStation], {
            color: '#7c3aed',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10',
        }).addTo(map);

        // Add route from start to end station (solid purple)
        L.polyline([startStation, endStation], {
            color: '#7c3aed',
            weight: 5,
            opacity: 0.9,
        }).addTo(map);

        // Fit bounds to show all markers
        const bounds = L.latLngBounds([userLocation, startStation, endStation]);
        map.fitBounds(bounds, { padding: [30, 30] });

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [userLocation, startStation, endStation, startName, endName]);

    return (
        <div
            ref={mapRef}
            className="w-full h-full rounded-lg overflow-hidden border-2 border-slate-200"
            style={{ minHeight: '300px' }}
        />
    );
}

