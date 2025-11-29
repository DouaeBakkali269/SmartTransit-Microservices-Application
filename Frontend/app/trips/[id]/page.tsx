'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Bus, Calendar, Clock, MapPin, Footprints, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';

// Dynamically import TripMap
const TripMap = dynamic(() => import('@/components/trip-map').then(mod => ({ default: mod.TripMap })), { ssr: false });

export default function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Unwrap the params Promise
    const { id } = use(params);

    const [trip, setTrip] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<[number, number]>([33.9715, -6.8498]);

    useEffect(() => {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                () => setUserLocation([33.9715, -6.8498])
            );
        }
    }, []);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const response = await api.get(`/trips/${id}`);
                setTrip(response.data.trip);
            } catch (error) {
                console.error("Error fetching trip:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrip();
    }, [id]);

    const handleBook = () => {
        if (!trip) return;

        // Redirect to checkout page with trip details
        // We pass minimal info or just ID if checkout supports fetching
        const params = new URLSearchParams({
            id: trip.id,
            line: trip.lineNumber,
            operator: trip.operator,
            from: trip.departureStation,
            to: trip.arrivalStation,
            depTime: trip.departureTime,
            arrTime: trip.arrivalTime,
            duration: trip.duration,
            price: trip.price.toString(),
            date: searchParams.get('date') || trip.date || new Date().toISOString().split('T')[0],
        });
        router.push(`/checkout?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center items-center h-[60vh]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500">Loading trip details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-8 text-center">
                    <h1 className="text-2xl font-bold text-slate-900">Trip not found</h1>
                    <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
                </div>
            </div>
        );
    }

    // Extract coordinates
    // Assuming API returns departureCoords/arrivalCoords or we get them from route stations
    const startCoords = trip.departureCoords || (trip.route?.stations?.[0]?.coordinates) || null;
    const endCoords = trip.arrivalCoords || (trip.route?.stations?.[trip.route.stations.length - 1]?.coordinates) || null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Results
                </Button>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Trip Details</h1>
                                <div className="flex items-center gap-2 mt-2 text-slate-600">
                                    <Bus className="h-4 w-4" />
                                    <span>{trip.operator}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-medium">Line {trip.lineNumber}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-slate-900">{trip.price} <span className="text-sm font-normal text-slate-500">DH</span></div>
                                <Button onClick={handleBook} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                                    Book Ticket
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Timeline */}
                        <div className="p-8 border-r border-slate-100">
                            <h2 className="font-semibold text-slate-900 mb-6">Itinerary</h2>
                            <div className="relative pl-4 space-y-0">
                                {/* Vertical Line */}
                                <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-slate-200"></div>

                                {/* Walking Departure */}
                                {trip.walkingDeparture && (
                                    <div className="relative flex items-start gap-4 pb-8">
                                        <div className="z-10 h-6 w-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Footprints className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-700 text-sm">Walk to station</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{trip.walkingDeparture.distance}km • {trip.walkingDeparture.duration} min</div>
                                        </div>
                                    </div>
                                )}

                                {/* Departure */}
                                <div className="relative flex items-start gap-4 pb-8">
                                    <div className="z-10 h-6 w-6 rounded-full bg-white border-4 border-blue-600 flex-shrink-0 mt-1"></div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-slate-900 text-lg">{trip.departureTime}</span>
                                            <span className="font-medium text-slate-700">{trip.departureStation}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Ride Info */}
                                <div className="relative flex items-center gap-4 pb-8">
                                    <div className="z-10 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Clock className="h-3 w-3 text-blue-600" />
                                    </div>
                                    <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                        <div className="font-medium">{trip.duration} Ride</div>
                                        <div className="text-xs text-slate-500 mt-1 flex gap-2">
                                            {trip.services && trip.services.map((s: string) => <span key={s}>{s}</span>)}
                                        </div>
                                    </div>
                                </div>

                                {/* Arrival */}
                                <div className="relative flex items-start gap-4 pb-8">
                                    <div className="z-10 h-6 w-6 rounded-full bg-white border-4 border-slate-900 flex-shrink-0 mt-1"></div>
                                    <div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold text-slate-900 text-lg">{trip.arrivalTime}</span>
                                            <span className="font-medium text-slate-700">{trip.arrivalStation}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Walking Arrival */}
                                {trip.walkingArrival && (
                                    <div className="relative flex items-start gap-4">
                                        <div className="z-10 h-6 w-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Footprints className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-700 text-sm">Walk to destination</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{trip.walkingArrival.distance}km • {trip.walkingArrival.duration} min</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Map */}
                        <div className="h-[500px] lg:h-auto bg-slate-100 relative">
                            {startCoords && endCoords ? (
                                <TripMap
                                    userLocation={userLocation}
                                    startStation={startCoords}
                                    endStation={endCoords}
                                    startName={trip.departureStation}
                                    endName={trip.arrivalStation}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                    Loading Map...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
