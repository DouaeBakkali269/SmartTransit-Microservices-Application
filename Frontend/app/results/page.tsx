'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Bus, MapPin, RefreshCw } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaymentModal } from '@/components/payment-modal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { calculateDistance } from '@/lib/distance';
import { findNearestLocation } from '@/lib/geolocation';
import { Footprints } from 'lucide-react';
import dynamic from 'next/dynamic';
import rabatLocations from '@/data/rabat-locations.json';

// Dynamically import map to avoid SSR issues
const DynamicTripMap = dynamic(
    () => import('@/components/trip-map').then(mod => ({ default: mod.TripMap })),
    { ssr: false }
);

// Types for trip results
type Trip = {
    id: string;
    lineNumber: string;
    operator: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    type: 'Direct' | 'With transfer';
    price: number;
    services: string[];
    isImmediate?: boolean;
    distance?: number;
    walkingDeparture?: {
        duration: number; // minutes
        distance: number; // km
        toStation: string;
    };
    walkingArrival?: {
        duration: number; // minutes
        distance: number; // km
        fromStation: string;
    };
    departureCoords?: [number, number];
    arrivalCoords?: [number, number];
};

// Location coordinates mapping (from rabat-locations.json)
// Location coordinates mapping (from rabat-locations.json)
const locationCoordinates: Record<string, [number, number]> = {};
rabatLocations.locations.forEach(loc => {
    locationCoordinates[loc.name.toUpperCase()] = [loc.coordinates[0], loc.coordinates[1]];
});

// Generate mock trips based on search parameters
// Generate mock trips based on search parameters
function generateMockTrips(
    from: string,
    to: string,
    userLocation: [number, number],
    fromCoords?: [number, number],
    toCoords?: [number, number]
): Trip[] {
    let startStationName = from;
    let endStationName = to;
    let startStationCoords = locationCoordinates[from.toUpperCase()] || locationCoordinates['ENSIAS'];
    let endStationCoords = locationCoordinates[to.toUpperCase()] || locationCoordinates['HASSAN TOWER'];

    let walkingDeparture = null;
    let walkingArrival = null;

    // If exact coordinates are provided, find the nearest stations
    if (fromCoords) {
        const nearestStart = findNearestLocation(fromCoords[0], fromCoords[1]);
        startStationName = nearestStart.name;
        startStationCoords = nearestStart.coordinates;

        // Apply 1.2x factor for walking path tortuosity
        const walkDist = calculateDistance(fromCoords[0], fromCoords[1], startStationCoords[0], startStationCoords[1]) * 1.2;
        if (walkDist > 0.05) { // Only show walking if distance > 50m
            walkingDeparture = {
                distance: parseFloat(walkDist.toFixed(2)),
                duration: Math.min(Math.ceil(walkDist * 10), 5), // Cap at 5 mins
                toStation: startStationName
            };
        }
    }

    if (toCoords) {
        const nearestEnd = findNearestLocation(toCoords[0], toCoords[1]);
        endStationName = nearestEnd.name;
        endStationCoords = nearestEnd.coordinates;

        // Apply 1.2x factor for walking path tortuosity
        const walkDist = calculateDistance(toCoords[0], toCoords[1], endStationCoords[0], endStationCoords[1]) * 1.2;
        if (walkDist > 0.05) {
            walkingArrival = {
                distance: parseFloat(walkDist.toFixed(2)),
                duration: Math.min(Math.ceil(walkDist * 10), 5), // Cap at 5 mins
                fromStation: endStationName
            };
        }
    }

    // Calculate distance between start and end stations
    const straightDistance = calculateDistance(
        startStationCoords[0],
        startStationCoords[1],
        endStationCoords[0],
        endStationCoords[1]
    );

    // Estimate road distance (approx 1.3x straight line distance for urban routes)
    const roadDistance = straightDistance * 1.3;

    // Calculate duration based on realistic city bus speed
    // User requested ~50km/h, using 40km/h as a realistic average for city transit including minor delays
    const averageSpeedKmh = 40;
    const durationHours = roadDistance / averageSpeedKmh;

    // Add 5 minutes for stops and boarding
    const durationMinutes = Math.round(durationHours * 60) + 5;
    const durationText = `${durationMinutes}min`;

    // Base trips with different times
    const baseTrips = [
        { id: '1', time: '08:00', line: '101', operator: 'ALSA City Bus', services: ['Air Conditioning', 'WiFi'], isImmediate: true },
        { id: '2', time: '09:00', line: '102', operator: 'ALSA City Bus', services: ['Air Conditioning'] },
        { id: '3', time: '10:30', line: '104', operator: 'ALSA City Bus', services: ['Air Conditioning'] },
        { id: '4', time: '12:00', line: '101', operator: 'ALSA City Bus', services: ['WiFi', 'Air Conditioning', 'USB Ports'] },
        { id: '5', time: '14:00', line: '102', operator: 'ALSA City Bus', services: ['Air Conditioning'] },
        { id: '6', time: '16:00', line: '104', operator: 'ALSA City Bus', services: ['WiFi', 'Air Conditioning'] },
        { id: '7', time: '18:00', line: '101', operator: 'ALSA City Bus', services: [] }
    ];

    return baseTrips.map(trip => {
        // Calculate arrival time
        const [hours, minutes] = trip.time.split(':').map(Number);
        const departureDate = new Date();
        departureDate.setHours(hours, minutes, 0, 0);
        const arrivalDate = new Date(departureDate.getTime() + durationMinutes * 60000);
        const arrivalTime = `${arrivalDate.getHours().toString().padStart(2, '0')}:${arrivalDate.getMinutes().toString().padStart(2, '0')}`;

        return {
            id: trip.id,
            lineNumber: trip.line,
            operator: trip.operator,
            departureStation: startStationName,
            arrivalStation: endStationName,
            departureTime: trip.time,
            arrivalTime: arrivalTime,
            duration: durationText,
            type: 'Direct',
            price: 5, // Standardized price
            services: trip.services,
            isImmediate: trip.isImmediate,
            distance: parseFloat(roadDistance.toFixed(1)),
            walkingDeparture: walkingDeparture || undefined,
            walkingArrival: walkingArrival || undefined,
            departureCoords: startStationCoords,
            arrivalCoords: endStationCoords
        };
    });
}

export default function ResultsPage() {
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || 'ENSIAS';
    const to = searchParams.get('to') || 'Hassan Tower';
    const fromLat = searchParams.get('fromLat');
    const fromLng = searchParams.get('fromLng');
    const toLat = searchParams.get('toLat');
    const toLng = searchParams.get('toLng');
    const date = searchParams.get('date') || new Date(2025, 10, 20).toISOString();
    const isExchangeMode = searchParams.get('exchange') === 'true';

    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());
    const [cartItems, setCartItems] = useState<Trip[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number]>([33.9715, -6.8498]);
    const [exchangingTicket, setExchangingTicket] = useState<any>(null);
    const [showConfirmExchange, setShowConfirmExchange] = useState(false);
    const [selectedExchangeTrip, setSelectedExchangeTrip] = useState<Trip | null>(null);

    const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);

    useEffect(() => {
        // Check if we're in exchange mode
        if (isExchangeMode) {
            const storedTicket = localStorage.getItem('exchangingTicket');
            if (storedTicket) {
                setExchangingTicket(JSON.parse(storedTicket));
            }
        }
    }, [isExchangeMode]);

    const router = useRouter();

    useEffect(() => {
        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                () => {
                    // Fallback to ENSIAS if geolocation fails
                    setUserLocation([33.9715, -6.8498]);
                }
            );
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const fromCoords: [number, number] | undefined = fromLat && fromLng ? [parseFloat(fromLat), parseFloat(fromLng)] : undefined;
            const toCoords: [number, number] | undefined = toLat && toLng ? [parseFloat(toLat), parseFloat(toLng)] : undefined;

            const mockTrips = generateMockTrips(from, to, userLocation, fromCoords, toCoords);
            setTrips(mockTrips);
            setLoading(false);
        }, 300);
    }, [from, to, userLocation, fromLat, fromLng, toLat, toLng]);

    const toggleTripExpansion = (tripId: string) => {
        const newExpanded = new Set(expandedTrips);
        if (newExpanded.has(tripId)) {
            newExpanded.delete(tripId);
        } else {
            newExpanded.add(tripId);
        }
        setExpandedTrips(newExpanded);
    };

    const addToCart = (trip: Trip) => {
        // If in exchange mode, show confirmation dialog before performing the exchange
        if (isExchangeMode && exchangingTicket) {
            setSelectedExchangeTrip(trip);
            setShowConfirmExchange(true);
            return;
        }

        // Normal booking flow
        if (!cartItems.find(item => item.id === trip.id)) {
            setCartItems([...cartItems, trip]);
        }
    };

    const confirmExchangeNow = (trip: Trip | null) => {
        if (!trip || !exchangingTicket) return;

        // Perform exchange: update stored tickets and set success flag, then redirect
        const storedTickets = localStorage.getItem('userTickets');
        if (!storedTickets) {
            setShowConfirmExchange(false);
            return;
        }

        const allTickets = JSON.parse(storedTickets);

        const updatedTickets = allTickets.map((ticket: any) => {
            if (ticket.id === exchangingTicket.id) {
                return {
                    ...ticket,
                    operator: trip.operator,
                    lineNumber: trip.lineNumber,
                    departureStation: trip.departureStation,
                    arrivalStation: trip.arrivalStation,
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime,
                    date: date,
                    price: trip.price,
                    exchangesRemaining: ticket.exchangesRemaining - 1,
                    status: 'exchanged' as const,
                    qrCodeUrl: ticket.qrCodeUrl
                };
            }
            return ticket;
        });

        // Store exchange success info for tickets page to show banner
        const originalTicket = JSON.parse(storedTickets).find((t: any) => t.id === exchangingTicket.id);
        if (originalTicket) {
            const remainingAfter = originalTicket.exchangesRemaining - 1;
            try {
                localStorage.setItem('exchangeSuccess', JSON.stringify({
                    message: 'Ticket exchanged successfully',
                    remaining: remainingAfter,
                    newTime: trip.departureTime
                }));
            } catch (e) {
                // ignore
            }
        }

        localStorage.setItem('userTickets', JSON.stringify(updatedTickets));
        localStorage.removeItem('exchangingTicket');
        setExchangingTicket(null);
        setShowConfirmExchange(false);

        // Redirect immediately to tickets page where the banner will show
        router.push('/tickets');
    };

    const removeFromCart = (tripId: string) => {
        setCartItems(cartItems.filter(item => item.id !== tripId));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Trip Results */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header */}
                        <div className="mb-6">
                            {isExchangeMode && exchangingTicket && (
                                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="h-6 w-6 text-orange-600" />
                                        <div>
                                            <h3 className="font-bold text-orange-900">Exchanging Ticket</h3>
                                            <p className="text-sm text-orange-700">
                                                Select a new trip to exchange your ticket. You have <strong>{exchangingTicket.exchangesRemaining} exchanges</strong> remaining.
                                            </p>
                                            <p className="text-xs text-orange-600 mt-1">
                                                Original: {exchangingTicket.departureStation} → {exchangingTicket.arrivalStation}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-purple-700 mb-2">
                                <span className="text-lg font-medium">Outbound</span>
                                <span className="text-slate-500">{formatDate(date)}</span>
                            </div>
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                                    <p className="text-slate-500 mt-4">Loading trips...</p>
                                </div>
                            ) : (
                                trips.map((trip) => {
                                    const isInCart = cartItems.find(item => item.id === trip.id);
                                    const startCoords = trip.departureCoords || locationCoordinates['ENSIAS'];
                                    const endCoords = trip.arrivalCoords || locationCoordinates['HASSAN TOWER'];

                                    return (
                                        <div key={trip.id} className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 mb-6 border border-slate-100">
                                            {/* Cutouts */}
                                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-r border-slate-200 z-10"></div>
                                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border-l border-slate-200 z-10"></div>

                                            <div className="flex flex-col lg:flex-row min-h-[180px]">
                                                {/* Left Section: Schedule & Info */}
                                                <div className="flex-1 p-6 flex flex-col justify-between relative">
                                                    {/* Top Row: Schedule */}
                                                    <div className="flex items-start justify-between gap-4 mb-6">
                                                        {/* Departure */}
                                                        <div className="text-center min-w-[120px]">
                                                            <div className="text-sm text-slate-500 mb-1">Departure</div>
                                                            <div className="text-3xl font-bold text-indigo-900">{trip.departureTime}</div>
                                                            <div className="text-sm font-medium text-indigo-700 mt-1 uppercase tracking-wide">{trip.departureStation}</div>
                                                            {trip.walkingDeparture && (
                                                                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-500">
                                                                    <Footprints className="h-3 w-3" />
                                                                    <span>+{trip.walkingDeparture.duration}min</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Middle: Duration & Line */}
                                                        <div className="flex-1 flex flex-col items-center px-4 mt-2">
                                                            <div className="text-lg text-indigo-900 font-medium mb-1">{trip.duration}</div>
                                                            <div className="w-full flex items-center gap-2">
                                                                <div className="h-2 w-2 rounded-full border-2 border-indigo-400 bg-white"></div>
                                                                <div className="h-[2px] flex-1 bg-indigo-100 relative">
                                                                    <div className="absolute inset-0 bg-indigo-200 w-full"></div>
                                                                </div>
                                                                <div className="h-2 w-2 rounded-full border-2 border-indigo-400 bg-white"></div>
                                                            </div>
                                                            <div className="text-sm text-indigo-700 mt-2">Direct</div>
                                                        </div>

                                                        {/* Arrival */}
                                                        <div className="text-center min-w-[120px]">
                                                            <div className="text-sm text-slate-500 mb-1">Arrival</div>
                                                            <div className="text-3xl font-bold text-indigo-900">{trip.arrivalTime}</div>
                                                            <div className="text-sm font-medium text-indigo-700 mt-1 uppercase tracking-wide">{trip.arrivalStation}</div>
                                                            {trip.walkingArrival && (
                                                                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-500">
                                                                    <Footprints className="h-3 w-3" />
                                                                    <span>+{trip.walkingArrival.duration}min</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="border-t border-slate-100 w-full my-2"></div>

                                                    {/* Bottom Row: Operator & Services */}
                                                    <div className="flex items-center justify-between mt-2">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <Bus className="h-5 w-5 text-indigo-600" />
                                                                <div className="flex flex-col">
                                                                    <span className="text-xs text-indigo-500 font-semibold uppercase">{trip.operator}</span>
                                                                    <span className="text-sm font-bold text-indigo-900">Line {trip.lineNumber}</span>
                                                                </div>
                                                            </div>
                                                            {trip.services.length > 0 && (
                                                                <div className="flex gap-2 ml-4">
                                                                    {trip.services.includes('WiFi') && (
                                                                        <span className="p-1.5 bg-indigo-50 rounded-full text-indigo-600" title="WiFi">
                                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                                                            </svg>
                                                                        </span>
                                                                    )}
                                                                    {trip.services.includes('Air Conditioning') && (
                                                                        <span className="p-1.5 bg-indigo-50 rounded-full text-indigo-600" title="AC">
                                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                            </svg>
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() => toggleTripExpansion(trip.id)}
                                                            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-indigo-600"
                                                        >
                                                            {expandedTrips.has(trip.id) ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Right Section: Price & Book */}
                                                <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-dashed border-slate-200 p-6 flex flex-col justify-center items-center bg-slate-50/30 lg:bg-transparent">
                                                    <div className="text-sm text-indigo-900 font-medium mb-1">1 Passenger</div>
                                                    <div className="text-xs text-slate-500 mb-2">from</div>
                                                    <div className="text-4xl font-bold text-red-500 mb-6">{trip.price} DH</div>

                                                    <Button
                                                        onClick={() => addToCart(trip)}
                                                        disabled={!isExchangeMode && !!isInCart}
                                                        className={`w-full h-12 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 ${isExchangeMode
                                                            ? 'bg-orange-600 hover:bg-orange-700'
                                                            : isInCart
                                                                ? 'bg-green-600 hover:bg-green-700'
                                                                : 'bg-[#482683] hover:bg-[#3b1e6b]' // Custom purple from image
                                                            } text-white`}
                                                    >
                                                        {isExchangeMode ? 'Exchange' : isInCart ? 'Added' : 'Book'}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {expandedTrips.has(trip.id) && (
                                                <div className="border-t border-slate-100 bg-slate-50/50 p-6 rounded-b-2xl">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                        <div>
                                                            <h4 className="font-semibold text-indigo-900 mb-4">Trip Details</h4>
                                                            <div className="space-y-6 relative">
                                                                {/* Vertical Line */}
                                                                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200"></div>

                                                                {/* Walking Departure */}
                                                                {trip.walkingDeparture && (
                                                                    <div className="relative flex items-start gap-4">
                                                                        <div className="z-10 h-10 w-10 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
                                                                            <Footprints className="h-5 w-5 text-slate-400" />
                                                                        </div>
                                                                        <div className="pt-2">
                                                                            <div className="font-medium text-slate-700">Walk from your location</div>
                                                                            <div className="text-sm text-slate-500">{trip.walkingDeparture.distance}km • {trip.walkingDeparture.duration} min</div>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Departure Station */}
                                                                <div className="relative flex items-start gap-4">
                                                                    <div className="z-10 h-10 w-10 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center flex-shrink-0">
                                                                        <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                                                                    </div>
                                                                    <div className="pt-2">
                                                                        <div className="font-bold text-indigo-900 text-lg">{trip.departureTime}</div>
                                                                        <div className="font-medium text-slate-700">{trip.departureStation}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Bus Ride */}
                                                                <div className="relative flex items-center gap-4 py-4">
                                                                    <div className="w-10 flex justify-center">
                                                                        <Bus className="h-5 w-5 text-indigo-400" />
                                                                    </div>
                                                                    <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                                                                        {trip.operator} • Line {trip.lineNumber} • {trip.duration}
                                                                    </div>
                                                                </div>

                                                                {/* Arrival Station */}
                                                                <div className="relative flex items-start gap-4">
                                                                    <div className="z-10 h-10 w-10 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center flex-shrink-0">
                                                                        <div className="h-3 w-3 rounded-full bg-white border-2 border-indigo-600"></div>
                                                                    </div>
                                                                    <div className="pt-2">
                                                                        <div className="font-bold text-indigo-900 text-lg">{trip.arrivalTime}</div>
                                                                        <div className="font-medium text-slate-700">{trip.arrivalStation}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Walking Arrival */}
                                                                {trip.walkingArrival && (
                                                                    <div className="relative flex items-start gap-4">
                                                                        <div className="z-10 h-10 w-10 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
                                                                            <Footprints className="h-5 w-5 text-slate-400" />
                                                                        </div>
                                                                        <div className="pt-2">
                                                                            <div className="font-medium text-slate-700">Walk to destination</div>
                                                                            <div className="text-sm text-slate-500">{trip.walkingArrival.distance}km • {trip.walkingArrival.duration} min</div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Map */}
                                                        <div className="h-full min-h-[300px] rounded-xl overflow-hidden border border-slate-200">
                                                            {startCoords && endCoords && (
                                                                <DynamicTripMap
                                                                    userLocation={userLocation}
                                                                    startStation={startCoords}
                                                                    endStation={endCoords}
                                                                    startName={trip.departureStation}
                                                                    endName={trip.arrivalStation}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Cart */}
                    <div className="lg:col-span-1">
                        <div className="bg-purple-700 text-white rounded-lg p-6 sticky top-8">
                            <h2 className="text-xl font-bold mb-6">My Cart</h2>

                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="relative mb-6">
                                        <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
                                            <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="2" strokeDasharray="4 4" opacity="0.3" />
                                            <path d="M35 50 L45 60 L65 40" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-medium">Your cart is empty</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="bg-purple-800 rounded-lg p-4 relative">
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                                title="Remove from cart"
                                            >
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>

                                            <div className="pr-8">
                                                <div className="flex items-center gap-2 mb-2 text-sm">
                                                    <Bus className="h-4 w-4" />
                                                    <span>Outbound {formatDate(date)} at {item.departureTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-lg font-bold mb-2">
                                                    <span>{item.departureStation}</span>
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    <span>{item.arrivalStation}</span>
                                                </div>
                                                <div className="text-sm opacity-90 mb-3">
                                                    1 Passenger (s)
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-bold text-green-400">{item.price} DH</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t border-purple-600 pt-6 mt-6">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm">Total amount:</span>
                                    <span className="text-2xl font-bold">{cartTotal} DH</span>
                                </div>

                                {cartItems.length > 0 && (
                                    <Button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full text-lg"
                                    >
                                        Continue
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false);
                    setCartItems([]);
                }}
                cartItems={cartItems}
                total={cartTotal}
                travelDate={date}
            />

            {/* Confirm Exchange Dialog */}
            <Dialog open={showConfirmExchange} onOpenChange={(open) => { if (!open) setShowConfirmExchange(false); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Exchange</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to exchange this ticket for the selected trip? This will consume one exchange and update your ticket's time.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => { setShowConfirmExchange(false); setSelectedExchangeTrip(null); }}>Cancel</Button>
                            <Button onClick={() => confirmExchangeNow(selectedExchangeTrip)} className="bg-orange-600 hover:bg-orange-700 text-white">Confirm Exchange</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
