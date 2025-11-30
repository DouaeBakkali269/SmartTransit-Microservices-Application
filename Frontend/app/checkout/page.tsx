'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bus, Calendar, Clock, CreditCard, Smartphone, Building2, CheckCircle2, ArrowLeft, Trash2 } from 'lucide-react';
import api from '@/lib/axios';

type Trip = {
    id: string;
    lineNumber: string;
    operator: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    price: number;
    date: string;
};

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [passengers, setPassengers] = useState(1);
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [cartItems, setCartItems] = useState<Trip[]>([]);
    const [bookingReference, setBookingReference] = useState('');

    useEffect(() => {
        // Try to get items from localStorage first
        const storedCart = localStorage.getItem('checkoutCart');
        if (storedCart) {
            try {
                const items = JSON.parse(storedCart);
                if (Array.isArray(items) && items.length > 0) {
                    setCartItems(items);
                    // Clear the cart from storage so it doesn't persist if they go back and forth
                    // Actually, better to keep it until payment success or manual removal
                    // localStorage.removeItem('checkoutCart'); 
                    return;
                }
            } catch (e) {
                console.error("Failed to parse cart items", e);
            }
        }

        // Fallback to URL params if no cart items
        const id = searchParams.get('id');
        if (id) {
            const trip: Trip = {
                id: id,
                lineNumber: searchParams.get('line') || '',
                operator: searchParams.get('operator') || '',
                departureStation: searchParams.get('from') || '',
                arrivalStation: searchParams.get('to') || '',
                departureTime: searchParams.get('depTime') || '',
                arrivalTime: searchParams.get('arrTime') || '',
                duration: searchParams.get('duration') || '',
                price: parseFloat(searchParams.get('price') || '0'),
                date: searchParams.get('date') || new Date().toISOString().split('T')[0],
            };
            setCartItems([trip]);
        }
    }, [searchParams]);

    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0) * (cartItems.length === 1 ? passengers : 1);

    // Format card number with spaces every 4 digits
    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, '');
        const limited = digits.slice(0, 16);
        const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
        return formatted;
    };

    // Format expiry date as MM/YY
    const formatExpiryDate = (value: string) => {
        const digits = value.replace(/\D/g, '');
        const limited = digits.slice(0, 4);
        if (limited.length >= 3) {
            return limited.slice(0, 2) + '/' + limited.slice(2);
        }
        return limited;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCardNumber(formatCardNumber(e.target.value));
    };

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setExpiryDate(formatExpiryDate(e.target.value));
    };

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            const bookings = [];

            // Create a booking for each item
            for (const item of cartItems) {
                // If single item, use selected passengers, otherwise 1
                const numPassengers = cartItems.length === 1 ? passengers : 1;

                const bookingRes = await api.post('/bookings', {
                    tripId: item.id,
                    date: item.date,
                    passengers: numPassengers
                });

                if (!bookingRes.data.booking?.id) {
                    throw new Error(`Failed to create booking for ${item.departureStation} to ${item.arrivalStation}`);
                }
                bookings.push(bookingRes.data.booking.id);
            }

            // Process Payment (Simulated for now as one transaction for all bookings)
            // In a real app, we might bundle them or process individually. 
            // Here we'll just process the first one or a "bulk" payment if API supported it.
            // Assuming the API handles one payment per booking, we might need to loop.
            // But let's assume we just need to verify payment once for the total amount.

            // For this demo, we'll process payment for the first booking ID as a reference
            const paymentDetails: any = {};
            if (paymentMethod === 'card') {
                paymentDetails.cardNumber = cardNumber.replace(/\s/g, '');
                paymentDetails.cardName = cardName;
                paymentDetails.expiryDate = expiryDate;
                paymentDetails.cvv = cvv;
            } else if (paymentMethod === 'mobile') {
                paymentDetails.phoneNumber = phoneNumber;
                paymentDetails.provider = 'orange';
            } else if (paymentMethod === 'bank') {
                paymentDetails.bankAccount = 'manual_transfer';
            }

            // We'll use the first booking ID for the payment record
            const paymentRes = await api.post('/payments/process', {
                bookingId: bookings[0],
                paymentMethod,
                paymentDetails,
                amount: totalPrice // Optional if API supports overriding amount
            });

            if (paymentRes.data.success) {
                // Generate a reference for display
                const ref = `BK${Date.now().toString().slice(-8)}`;
                setBookingReference(ref);

                // Save tickets to localStorage (Client-side simulation of ticket generation)
                const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
                const newTickets = cartItems.map((item, index) => ({
                    id: `${ref}-${index}`,
                    bookingReference: ref,
                    operator: item.operator,
                    lineNumber: item.lineNumber,
                    departureStation: item.departureStation,
                    arrivalStation: item.arrivalStation,
                    departureTime: item.departureTime,
                    arrivalTime: item.arrivalTime,
                    date: item.date,
                    price: item.price,
                    passengers: cartItems.length === 1 ? passengers : 1,
                    qrCodeUrl: '',
                    exchangesRemaining: 3,
                    status: 'active' as const
                }));
                localStorage.setItem('userTickets', JSON.stringify([...existingTickets, ...newTickets]));

                // Clear cart
                localStorage.removeItem('checkoutCart');

                setPaymentSuccess(true);
                setTimeout(() => {
                    router.push('/tickets');
                }, 3000);
            } else {
                alert('Payment failed: ' + (paymentRes.data.error?.message || 'Unknown error'));
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            alert('An error occurred during payment processing: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const removeItem = (index: number) => {
        const newItems = [...cartItems];
        newItems.splice(index, 1);
        setCartItems(newItems);
        localStorage.setItem('checkoutCart', JSON.stringify(newItems));

        if (newItems.length === 0) {
            router.back();
        }
    };

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 py-16">
                    <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-12 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment Successful!</h1>
                        <p className="text-slate-600 mb-8">Your tickets have been booked successfully.</p>

                        <div className="bg-slate-50 rounded-lg p-6 mb-8 text-left">
                            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-4">
                                <span className="text-slate-600">Booking Reference</span>
                                <span className="font-mono font-bold text-slate-900">{bookingReference}</span>
                            </div>
                            <div className="space-y-4">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-slate-900">{item.departureStation} → {item.arrivalStation}</div>
                                            <div className="text-sm text-slate-600">{new Date(item.date).toLocaleDateString()} • {item.departureTime}</div>
                                        </div>
                                        <div className="font-semibold text-slate-900">{item.price} DH</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                                <span className="font-bold text-slate-900">Total Paid</span>
                                <span className="text-2xl font-bold text-green-600">{totalPrice} DH</span>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500">Redirecting to your tickets...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="max-w-6xl mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 pl-0 hover:pl-2 transition-all"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Results
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Trip Summary */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h2>

                            <div className="space-y-6 mb-6">
                                {cartItems.map((trip, index) => (
                                    <div key={index} className="relative bg-slate-50 rounded-lg p-4 border border-slate-100">
                                        {cartItems.length > 1 && (
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}

                                        <div className="flex items-center gap-3 text-sm mb-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <Bus className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{trip.operator}</div>
                                                <div className="text-slate-500">Line {trip.lineNumber}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="flex flex-col items-center mt-1">
                                                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                                                <div className="w-0.5 h-8 border-l border-dashed border-slate-300 my-1"></div>
                                                <div className="h-2 w-2 rounded-full bg-slate-900"></div>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <div className="font-semibold text-slate-900">{trip.departureTime}</div>
                                                    <div className="text-sm text-slate-600">{trip.departureStation}</div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{trip.arrivalTime}</div>
                                                    <div className="text-sm text-slate-600">{trip.arrivalStation}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-slate-600 pt-2 border-t border-slate-200">
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(trip.date).toLocaleDateString()}</span>
                                            <span className="mx-1">•</span>
                                            <Clock className="h-3 w-3" />
                                            <span>{trip.duration}</span>
                                        </div>

                                        <div className="mt-3 text-right font-bold text-slate-900">
                                            {trip.price} DH
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {cartItems.length === 1 && (
                                <div className="border-t border-slate-100 pt-4 mb-4">
                                    <Label htmlFor="passengers" className="text-sm font-medium text-slate-700 mb-2 block">
                                        Number of Passengers
                                    </Label>
                                    <Input
                                        id="passengers"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={passengers}
                                        onChange={(e) => setPassengers(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-600">Items</span>
                                    <span className="font-medium text-slate-900">{cartItems.length}</span>
                                </div>
                                {cartItems.length === 1 && (
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-slate-600">Passengers</span>
                                        <span className="font-medium text-slate-900">×{passengers}</span>
                                    </div>
                                )}
                                <div className="border-t border-slate-100 pt-3 mt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-slate-900">Total</span>
                                        <span className="text-2xl font-bold text-blue-600">{totalPrice} DH</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Payment Details */}
                    <div className="lg:col-span-2">
                        <Card className="p-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-8">Payment Details</h2>

                            {/* Payment Method Selection */}
                            <div className="mb-8">
                                <Label className="text-base font-semibold text-slate-900 mb-4 block">
                                    Payment Method
                                </Label>
                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <div className="space-y-3">
                                        <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                                            }`}>
                                            <RadioGroupItem value="card" id="card" />
                                            <CreditCard className={`h-5 w-5 ${paymentMethod === 'card' ? 'text-blue-600' : 'text-slate-400'}`} />
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900">Credit / Debit Card</div>
                                                <div className="text-sm text-slate-500">Pay securely with your card</div>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'mobile' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                                            }`}>
                                            <RadioGroupItem value="mobile" id="mobile" />
                                            <Smartphone className={`h-5 w-5 ${paymentMethod === 'mobile' ? 'text-blue-600' : 'text-slate-400'}`} />
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900">Mobile Money</div>
                                                <div className="text-sm text-slate-500">Orange Money, Inwi Money, etc.</div>
                                            </div>
                                        </label>

                                        <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'bank' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                                            }`}>
                                            <RadioGroupItem value="bank" id="bank" />
                                            <Building2 className={`h-5 w-5 ${paymentMethod === 'bank' ? 'text-blue-600' : 'text-slate-400'}`} />
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-900">Bank Transfer</div>
                                                <div className="text-sm text-slate-500">Direct bank transfer</div>
                                            </div>
                                        </label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {/* Card Payment Form */}
                            {paymentMethod === 'card' && (
                                <div className="space-y-6 mb-8">
                                    <div>
                                        <Label htmlFor="cardNumber" className="text-sm font-medium text-slate-700 mb-2 block">
                                            Card Number
                                        </Label>
                                        <Input
                                            id="cardNumber"
                                            placeholder="1234 5678 9012 3456"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            maxLength={19}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="cardName" className="text-sm font-medium text-slate-700 mb-2 block">
                                            Cardholder Name
                                        </Label>
                                        <Input
                                            id="cardName"
                                            placeholder="John Doe"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="expiry" className="text-sm font-medium text-slate-700 mb-2 block">
                                                Expiry Date
                                            </Label>
                                            <Input
                                                id="expiry"
                                                placeholder="MM/YY"
                                                value={expiryDate}
                                                onChange={handleExpiryDateChange}
                                                maxLength={5}
                                                className="w-full"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="cvv" className="text-sm font-medium text-slate-700 mb-2 block">
                                                CVV
                                            </Label>
                                            <Input
                                                id="cvv"
                                                placeholder="123"
                                                type="password"
                                                value={cvv}
                                                onChange={(e) => setCvv(e.target.value)}
                                                maxLength={3}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Money Form */}
                            {paymentMethod === 'mobile' && (
                                <div className="space-y-6 mb-8">
                                    <div>
                                        <Label htmlFor="phoneNumber" className="text-sm font-medium text-slate-700 mb-2 block">
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phoneNumber"
                                            placeholder="+212 6XX XXX XXX"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Bank Transfer Info */}
                            {paymentMethod === 'bank' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                                    <h3 className="font-semibold text-slate-900 mb-3">Bank Transfer Details</h3>
                                    <div className="space-y-2 text-sm text-slate-700">
                                        <div><span className="font-medium">Bank:</span> SmartTransit Bank</div>
                                        <div><span className="font-medium">Account:</span> 1234567890</div>
                                        <div><span className="font-medium">IBAN:</span> MA64 0123 4567 8901 2345 6789</div>
                                        <div className="mt-3 text-xs text-slate-600">
                                            Please include your booking reference in the transfer description.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Pay Button */}
                            <Button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg font-semibold"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing Payment...
                                    </div>
                                ) : (
                                    `Pay ${totalPrice} DH`
                                )}
                            </Button>

                            <p className="text-xs text-center text-slate-500 mt-4">
                                By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
