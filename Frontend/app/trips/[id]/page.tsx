'use client';

import { use, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Bus, Calendar, Clock, MapPin, Footprints, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import { calculateDistance } from '@/lib/distance';
import rabatLocations from '@/data/rabat-locations.json';

// Dynamically import TripMap
const TripMap = dynamic(() => import('@/components/trip-map').then(mod => ({ default: mod.TripMap })), { ssr: false });

// Location coordinates mapping
const locationCoordinates: Record<string, [number, number]> = {};
rabatLocations.locations.forEach(loc => {
    locationCoordinates[loc.name.toUpperCase()] = [loc.coordinates[0], loc.coordinates[1]];
});

export default function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Unwrap the params Promise
    const { id } = use(params);

    // Parse trip details from URL params
    const trip = {
        id: id,
        lineNumber: searchParams.get('line') || '',
        operator: searchParams.get('operator') || '',
        departureStation: searchParams.get('from') || '',
        arrivalStation: searchParams.get('to') || '',
        departureTime: searchParams.get('depTime') || '',
        arrivalTime: searchParams.get('arrTime') || '',
        duration: searchParams.get('duration') || '',
        price: parseFloat(searchParams.get('price') || '0'),
        services: searchParams.get('services')?.split(',') || [],
        walkingDepDist: searchParams.get('walkDepDist'),
        walkingDepDur: searchParams.get('walkDepDur'),
        walkingArrDist: searchParams.get('walkArrDist'),
        walkingArrDur: searchParams.get('walkArrDur'),
    };

    const [userLocation, setUserLocation] = useState<[number, number]>([33.9715, -6.8498]);
    const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
    const [endCoords, setEndCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                () => setUserLocation([33.9715, -6.8498])
            );
        }

        // Resolve coordinates
        const resolveCoords = async (name: string) => {
            // Try local data first
            const local = locationCoordinates[name.toUpperCase()];
            if (local) return local;

            // Fallback to geocoding
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name + ' Rabat')}&limit=1`;
                const res = await fetch(url);
                const data = await res.json();
                if (data && data.length > 0) {
                    return [parseFloat(data[0].lat), parseFloat(data[0].lon)] as [number, number];
                }
            } catch (e) {
                console.error('Geocoding failed', e);
            }
            return null;
        };

        if (trip.departureStation) {
            resolveCoords(trip.departureStation).then(coords => {
                if (coords) setStartCoords(coords);
            });
        }
        if (trip.arrivalStation) {
            resolveCoords(trip.arrivalStation).then(coords => {
                if (coords) setEndCoords(coords);
            });
        }
    }, [trip.departureStation, trip.arrivalStation]);

    const handleBook = () => {
        // Redirect to checkout page with trip details
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
            date: searchParams.get('date') || new Date().toISOString().split('T')[0],
        });
        router.push(`/checkout?${params.toString()}`);
    };

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
                                {trip.walkingDepDist && (
                                    <div className="relative flex items-start gap-4 pb-8">
                                        <div className="z-10 h-6 w-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Footprints className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-700 text-sm">Walk to station</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{trip.walkingDepDist}km • {trip.walkingDepDur} min</div>
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
                                            {trip.services.map(s => <span key={s}>{s}</span>)}
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
                                {trip.walkingArrDist && (
                                    <div className="relative flex items-start gap-4">
                                        <div className="z-10 h-6 w-6 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center flex-shrink-0 mt-1">
                                            <Footprints className="h-3 w-3 text-slate-400" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-700 text-sm">Walk to destination</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{trip.walkingArrDist}km • {trip.walkingArrDur} min</div>
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
