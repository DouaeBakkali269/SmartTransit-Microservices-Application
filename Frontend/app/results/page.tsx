'use client';

import { useEffect, useState, Suspense } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bus } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { TripResultCard, type Trip } from '@/components/trip-result-card';
import api from '@/lib/axios';
import { useAuth } from '@/lib/auth-context';

export default function ResultsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <ResultsContent />
        </Suspense>
    );
}

function ResultsContent() {
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || 'ENSIAS';
    const to = searchParams.get('to') || 'Hassan Tower';
    const fromLat = searchParams.get('fromLat');
    const fromLng = searchParams.get('fromLng');
    const toLat = searchParams.get('toLat');
    const toLng = searchParams.get('toLng');
    const date = searchParams.get('date') || new Date().toISOString();
    const timeOption = searchParams.get('timeOption') || 'now';
    const isExchangeMode = searchParams.get('exchange') === 'true';
    const { user } = useAuth();

    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartItems, setCartItems] = useState<Trip[]>([]);

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
                const ticket = JSON.parse(storedTicket);
                // Fetch fresh details from API
                api.get(`/tickets/${ticket.id}`)
                    .then(res => setExchangingTicket(res.data))
                    .catch(err => {
                        console.error('Error fetching ticket details:', err);
                        // Fallback to stored ticket if API fails
                        setExchangingTicket(ticket);
                    });
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
        const fetchTrips = async () => {
            setLoading(true);
            try {
                const params: any = {
                    from,
                    to,
                    date,
                    timeOption
                };

                if (fromLat) params.fromLat = fromLat;
                if (fromLng) params.fromLng = fromLng;
                if (toLat) params.toLat = toLat;
                if (toLng) params.toLng = toLng;

                const response = await api.get('/routes/search', { params });
                setTrips(response.data.trips || []);
            } catch (error) {
                console.error("Error fetching trips:", error);
                setTrips([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, [from, to, fromLat, fromLng, toLat, toLng, date, timeOption]);

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

    const confirmExchangeNow = async (trip: Trip | null) => {
        if (!trip || !exchangingTicket) return;

        try {
            await api.post(`/tickets/${exchangingTicket.id}/exchange`, {
                newTripId: trip.id,
                newDate: date
            });

            // Store exchange success info for tickets page to show banner
            const remainingAfter = exchangingTicket.exchangesRemaining - 1;
            try {
                localStorage.setItem('exchangeSuccess', JSON.stringify({
                    message: 'Ticket exchanged successfully',
                    remaining: remainingAfter,
                    newTime: trip.departureTime
                }));
            } catch (e) {
                // ignore
            }

            localStorage.removeItem('exchangingTicket');
            setExchangingTicket(null);
            setShowConfirmExchange(false);

            // Redirect immediately to tickets page where the banner will show
            router.push('/tickets');
        } catch (error) {
            console.error("Exchange failed:", error);
            alert("Failed to exchange ticket. Please try again.");
        }
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
                                trips.length > 0 ? (
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
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                        <div className="inline-block p-4 rounded-full bg-slate-100 mb-4">
                                            <Bus className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900">No trips found</h3>
                                        <p className="text-slate-500 mt-2">Try adjusting your search criteria</p>
                                    </div>
                                )
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
                                        onClick={() => {
                                            localStorage.setItem('checkoutCart', JSON.stringify(cartItems));
                                            router.push('/checkout');
                                        }}
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
