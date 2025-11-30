'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Station {
    id: string;
    name: string;
    coordinates: [number, number];
}

interface LineEditorMapProps {
    stations: Station[];
    onStationsChange: (stations: Station[]) => void;
}

export function LineEditorMap({ stations, onStationsChange }: LineEditorMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const polylineRef = useRef<L.Polyline | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    // Initialize Map
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current).setView([33.9716, -6.8498], 13); // Default to Rabat

        const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        });

        tileLayer.addTo(map);
        tileLayerRef.current = tileLayer;
        mapInstanceRef.current = map;
        setIsMounted(true);

        // Add click handler to map for adding new stations
        map.on('click', (e: L.LeafletMouseEvent) => {
            const newStation: Station = {
                id: `temp-${Date.now()}`,
                name: `New Station ${stations.length + 1}`,
                coordinates: [e.latlng.lat, e.latlng.lng]
            };
            onStationsChange([...stations, newStation]);
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []); // Empty dependency array, map inits once

    // Update Markers and Polyline when stations change
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !isMounted) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Clear existing polyline
        if (polylineRef.current) {
            polylineRef.current.remove();
            polylineRef.current = null;
        }

        // Add Markers
        stations.forEach((station, index) => {
            const marker = L.marker(station.coordinates, {
                draggable: true,
                icon: L.divIcon({
                    className: 'editor-marker',
                    html: `<div style="background-color: ${index === 0 ? '#22c55e' : (index === stations.length - 1 ? '#ef4444' : '#3b82f6')}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px;">${index + 1}</div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                })
            });

            marker.addTo(map);
            markersRef.current.push(marker);

            // Drag End Event
            marker.on('dragend', (e) => {
                const marker = e.target as L.Marker;
                const newPos = marker.getLatLng();
                const updatedStations = [...stations];
                updatedStations[index] = {
                    ...updatedStations[index],
                    coordinates: [newPos.lat, newPos.lng]
                };
                onStationsChange(updatedStations);
            });

            // Click/Popup for Delete
            const popupContent = document.createElement('div');
            popupContent.innerHTML = `
                <div class="p-2">
                    <p class="font-bold mb-2">${station.name}</p>
                    <button id="delete-btn-${station.id}" class="bg-red-500 text-white px-3 py-1 rounded text-xs w-full hover:bg-red-600">Delete Station</button>
                </div>
            `;

            // We need to attach the event listener after the popup opens
            marker.bindPopup(popupContent);
            marker.on('popupopen', () => {
                const btn = document.getElementById(`delete-btn-${station.id}`);
                if (btn) {
                    btn.onclick = () => {
                        const updatedStations = stations.filter((_, i) => i !== index);
                        onStationsChange(updatedStations);
                        map.closePopup();
                    };
                }
            });
        });

        // Draw Polyline (Simple straight lines for editor, OSRM is for display)
        if (stations.length > 1) {
            const latlngs = stations.map(s => s.coordinates);
            const polyline = L.polyline(latlngs, { color: '#64748b', dashArray: '5, 10', weight: 3 }).addTo(map);
            polylineRef.current = polyline;
        }

    }, [stations, isMounted]); // Re-run when stations change

    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden border border-slate-200">
            <div ref={mapRef} className="w-full h-full bg-slate-100" />
            <div className="absolute top-4 right-4 bg-white p-2 rounded shadow-md z-[1000] text-xs text-slate-600">
                <p>Click map to add station</p>
                <p>Drag markers to move</p>
                <p>Click marker to delete</p>
            </div>
        </div>
    );
}
