'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useRef } from 'react';
import { reverseGeocode, type Location } from '@/lib/geolocation';

// Fix for default marker icon
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for selected location
const selectedIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [30, 49],
    iconAnchor: [15, 49],
    popupAnchor: [1, -40],
    shadowSize: [50, 50],
    className: 'selected-marker'
});

interface MapProps {
    center?: [number, number];
    zoom?: number;
    selectedLocation?: Location | null;
    onLocationSelect?: (lat: number, lng: number, name: string, address: string) => void;
    clickable?: boolean;
    markers?: Array<{ position: [number, number]; name: string; address?: string }>;
    route?: { start: [number, number]; end: [number, number] } | null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number, name: string, address: string) => void }) {
    const [isLoading, setIsLoading] = useState(false);

    useMapEvents({
        click: async (e) => {
            if (!onLocationSelect) return;

            setIsLoading(true);
            const { lat, lng } = e.latlng;

            try {
                const { name, address } = await reverseGeocode(lat, lng);
                onLocationSelect(lat, lng, name, address);
            } catch (error) {
                console.error('Error reverse geocoding:', error);
                onLocationSelect(lat, lng, 'Selected Location', `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            } finally {
                setIsLoading(false);
            }
        },
    });

    return isLoading ? (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg z-[1000] text-sm">
            Loading location...
        </div>
    ) : null;
}

function RouteLayer({ start, end }: { start: [number, number]; end: [number, number] }) {
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const map = useMapEvents({});

    useEffect(() => {
        let isMounted = true;
        const fetchRoute = async () => {
            try {
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
                );
                const data = await response.json();

                if (isMounted && data.routes && data.routes.length > 0) {
                    const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                    setRouteCoords(coords);

                    // Fit bounds to route
                    const bounds = L.latLngBounds(coords);
                    map.fitBounds(bounds, { padding: [50, 50] });
                } else if (isMounted) {
                    // Fallback to straight line
                    setRouteCoords([start, end]);
                    map.fitBounds(L.latLngBounds([start, end]), { padding: [50, 50] });
                }
            } catch (error) {
                console.error("Failed to fetch route:", error);
                if (isMounted) {
                    setRouteCoords([start, end]);
                }
            }
        };

        fetchRoute();

        return () => {
            isMounted = false;
        };
    }, [start, end, map]);

    if (routeCoords.length === 0) return null;

    return (
        <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#2563eb', weight: 5, opacity: 0.8 }}
        />
    );
}

export default function Map({
    center = [33.9716, -6.8498], // Default to ENSIAS, Rabat
    zoom = 13,
    selectedLocation,
    onLocationSelect,
    clickable = false,
    markers = [],
    route
}: MapProps) {
    const [mapCenter, setMapCenter] = useState<[number, number]>(center);

    useEffect(() => {
        // Fix for Leaflet icon issue in Next.js
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
    }, []);

    useEffect(() => {
        if (selectedLocation) {
            setMapCenter(selectedLocation.coordinates);
        }
    }, [selectedLocation]);

    return (
        <MapContainer
            center={mapCenter}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-full w-full rounded-lg z-0"
            style={{ cursor: clickable ? 'crosshair' : 'grab' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">Carto</a> &amp; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                maxZoom={19}
            />

            {clickable && <MapClickHandler onLocationSelect={onLocationSelect} />}

            {/* Route Layer */}
            {route && <RouteLayer start={route.start} end={route.end} />}

            {/* Selected location marker */}
            {selectedLocation && (
                <Marker
                    position={selectedLocation.coordinates}
                    icon={selectedIcon}
                >
                    <Popup>
                        <div className="text-sm">
                            <div className="font-semibold text-slate-900">{selectedLocation.name}</div>
                            <div className="text-xs text-slate-500 mt-1">{selectedLocation.address}</div>
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Additional markers */}
            {markers.map((marker, index) => (
                <Marker
                    key={index}
                    position={marker.position}
                    icon={defaultIcon}
                >
                    <Popup>
                        <div className="text-sm">
                            <div className="font-semibold text-slate-900">{marker.name}</div>
                            {marker.address && (
                                <div className="text-xs text-slate-500 mt-1">{marker.address}</div>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
