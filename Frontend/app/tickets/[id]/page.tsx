'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Bus, Calendar, QrCode as QrCodeIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';

// Dynamically import TripMap to avoid SSR issues
const TripMap = dynamic(() => import('@/components/trip-map').then(mod => ({ default: mod.TripMap })), { ssr: false });

export default function TicketDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const ticketId = params?.id as string;

    const [ticket, setTicket] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number]>([33.9715, -6.8498]);
    const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
    const [endCoords, setEndCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await api.get(`/tickets/${ticketId}`);
                const ticketData = response.data.ticket;
                setTicket(ticketData);

                // Set coordinates if available
                if (ticketData.stationDetails?.departure?.coordinates) {
                    setStartCoords(ticketData.stationDetails.departure.coordinates);
                }
                if (ticketData.stationDetails?.arrival?.coordinates) {
                    setEndCoords(ticketData.stationDetails.arrival.coordinates);
                }
            } catch (error) {
                console.error("Error fetching ticket:", error);
            } finally {
                setLoading(false);
            }
        };

        if (ticketId) {
            fetchTicket();
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
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-4xl mx-auto p-8 flex justify-center">
                    <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

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
                        <div className="h-[500px]">
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
