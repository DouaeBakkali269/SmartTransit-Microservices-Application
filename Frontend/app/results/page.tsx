'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bus } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PaymentModal } from '@/components/payment-modal';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { calculateDistance } from '@/lib/distance';
import { findNearestLocation } from '@/lib/geolocation';
import rabatLocations from '@/data/rabat-locations.json';
import { TripResultCard, type Trip } from '@/components/trip-result-card';

// Location coordinates mapping (from rabat-locations.json)
const locationCoordinates: Record<string, [number, number]> = {};
rabatLocations.locations.forEach(loc => {
    locationCoordinates[loc.name.toUpperCase()] = [loc.coordinates[0], loc.coordinates[1]];
});

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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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
                            <div className="flex items-center gap-2 text-blue-900 mb-2">
                                <span className="text-lg font-bold">Outbound</span>
                                <span className="text-slate-500 font-medium">{formatDate(date)}</span>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                                    <p className="text-slate-500 mt-4">Finding best routes...</p>
                                </div>
                            ) : (
                                trips.map((trip) => (
                                    <TripResultCard
                                        key={trip.id}
                                        trip={trip}
                                        isInCart={!!cartItems.find(item => item.id === trip.id)}
                                        isExchangeMode={isExchangeMode}
                                        onAddToCart={addToCart}
                                        userLocation={userLocation}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Cart */}
                    <div className="lg:col-span-1">
                        <div className="bg-blue-900 text-white rounded-xl p-6 sticky top-24 shadow-lg">
                            <h2 className="text-xl font-bold mb-6">My Cart</h2>

                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <div className="relative mb-6 opacity-50">
                                        <Bus className="h-16 w-16 text-blue-200" />
                                    </div>
                                    <p className="text-lg font-medium text-blue-100">Your cart is empty</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="bg-blue-800 rounded-lg p-4 relative group">
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="absolute top-3 right-3 h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                                title="Remove from cart"
                                            >
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>

                                            <div className="pr-8">
                                                <div className="flex items-center gap-2 mb-2 text-xs text-blue-200">
                                                    <Bus className="h-3 w-3" />
                                                    <span>Outbound • {item.departureTime}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-base font-bold mb-2">
                                                    <span>{item.departureStation}</span>
                                                    <svg className="h-3 w-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                    <span>{item.arrivalStation}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-green-400">{item.price} DH</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-t border-blue-700 pt-6 mt-6">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-sm text-blue-200">Total amount:</span>
                                    <span className="text-2xl font-bold">{cartTotal} DH</span>
                                </div>

                                {cartItems.length > 0 && (
                                    <Button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg text-lg shadow-md hover:shadow-lg transition-all"
                                    >
                                        Continue to Payment
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
