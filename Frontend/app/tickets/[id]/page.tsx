'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Bus, Calendar, QrCode as QrCodeIcon } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import TripMap to avoid SSR issues
const TripMap = dynamic(() => import('@/components/trip-map').then(mod => ({ default: mod.TripMap })), { ssr: false });

export default function TicketDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const ticketId = params?.id as string;

    const [ticket, setTicket] = useState<any | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number]>([33.9715, -6.8498]);
    const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
    const [endCoords, setEndCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        // Load ticket from localStorage
        try {
            const stored = localStorage.getItem('userTickets');
            if (stored) {
                const all = JSON.parse(stored);
                const found = all.find((t: any) => t.id === ticketId);
                if (found) setTicket(found);
            }
        } catch (e) {
            console.error('Failed to read tickets from storage', e);
        }
    }, [ticketId]);

    useEffect(() => {
        // get user current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                () => setUserLocation([33.9715, -6.8498])
            );
        }

        // load station coordinates from data file
        (async () => {
            try {
                const mod = await import('@/data/rabat-locations.json');
                const locations = mod.locations as Array<any>;

                const normalize = (s: any) => String(s || '').toLowerCase().trim();
                const ticketStart = normalize(ticket?.departureStation);
                const ticketEnd = normalize(ticket?.arrivalStation);

                const findLocal = (query: string) => {
                    if (!query) return null;
                    // exact
                    let found = locations.find(l => normalize(l.name) === query);
                    if (found) return found;
                    // partial includes
                    found = locations.find(l => normalize(l.name).includes(query) || query.includes(normalize(l.name)));
                    if (found) return found;
                    // token match (any word)
                    const tokens = query.split(/\s+/).filter(Boolean);
                    for (const t of tokens) {
                        const f = locations.find(l => normalize(l.name).includes(t));
                        if (f) return f;
                    }
                    return null;
                };

                const geocode = async (q: string) => {
                    if (!q) return null;
                    try {
                        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ' Rabat')}&limit=1`;
                        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
                        if (!res.ok) return null;
                        const data = await res.json();
                        if (data && data.length > 0) {
                            const lat = parseFloat(data[0].lat);
                            const lon = parseFloat(data[0].lon);
                            return [lat, lon] as [number, number];
                        }
                    } catch (e) {
                        console.warn('Geocode failed', e);
                    }
                    return null;
                };

                // find start
                let start = findLocal(ticketStart);
                if (start) setStartCoords([start.coordinates[0], start.coordinates[1]]);
                else {
                    const coords = await geocode(String(ticket?.departureStation || ''));
                    if (coords) setStartCoords(coords);
                }

                // find end
                let end = findLocal(ticketEnd);
                if (end) setEndCoords([end.coordinates[0], end.coordinates[1]]);
                else {
                    const coords = await geocode(String(ticket?.arrivalStation || ''));
                    if (coords) setEndCoords(coords);
                }
            } catch (e) {
                console.error('Could not load locations or geocode', e);
            }
        })();
    }, [ticket]);

    if (!ticket) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-4xl mx-auto p-8">
                    <p className="text-slate-600">Ticket not found.</p>
                    <Button onClick={() => router.push('/tickets')} className="mt-4">Back to tickets</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="text-sm text-slate-500">Ref: {ticket.bookingReference}</div>
                                <h1 className="text-2xl font-bold text-slate-900">{ticket.departureStation} → {ticket.arrivalStation}</h1>
                                <div className="text-xs text-slate-500 mt-1">Operator: {ticket.operator} • Line {ticket.lineNumber}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-slate-500">Price</div>
                                <div className="text-2xl font-bold text-green-600">{ticket.price} DH</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <div className="text-xs text-slate-500">Date</div>
                                <div className="font-semibold">{new Date(ticket.date).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Departure</div>
                                <div className="font-semibold">{ticket.departureTime}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Arrival</div>
                                <div className="font-semibold">{ticket.arrivalTime}</div>
                            </div>
                            <div>
                                <div className="text-xs text-slate-500">Passengers</div>
                                <div className="font-semibold">{ticket.passengers}</div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-20 h-20 bg-white rounded-md flex items-center justify-center border">
                                    <img src={ticket.qrCodeUrl} alt="QR" className="w-16 h-16" />
                                </div>
                                <div>
                                    <div className="font-semibold">Ticket QR</div>
                                    <div className="text-xs text-slate-500 mt-1">Show this QR to verify your ticket.</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={() => router.push('/tickets')}>Back</Button>
                        </div>
                    </div>

                    <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-slate-200 p-4">
                        <div className="text-sm text-slate-600 mb-3">Trip Map</div>
                        <div className="h-72">
                            {startCoords && endCoords ? (
                                // TripMap shows user location, start, end and the routes
                                <TripMap
                                    userLocation={userLocation}
                                    startStation={startCoords}
                                    endStation={endCoords}
                                    startName={ticket.departureStation}
                                    endName={ticket.arrivalStation}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-400">Map not available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
