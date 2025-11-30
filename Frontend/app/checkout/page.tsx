'use client';

import { use, useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bus, Calendar, Clock, MapPin, CreditCard, Smartphone, Building2, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '@/lib/axios';

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

    // Parse trip details from URL params
    const trip = {
        id: searchParams.get('id') || '',
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

    const totalPrice = trip.price * passengers;

    // Format card number with spaces every 4 digits
    const formatCardNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');
        // Limit to 16 digits
        const limited = digits.slice(0, 16);
        // Add space every 4 digits
        const formatted = limited.match(/.{1,4}/g)?.join(' ') || limited;
        return formatted;
    };

    // Format expiry date as MM/YY
    const formatExpiryDate = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');
        // Limit to 4 digits (MMYY)
        const limited = digits.slice(0, 4);

        if (limited.length >= 3) {
            // Add slash after MM
            return limited.slice(0, 2) + '/' + limited.slice(2);
        }
        return limited;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        setCardNumber(formatted);
    };

    const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatExpiryDate(e.target.value);
        setExpiryDate(formatted);
    };

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            // 1. Create Booking
            const bookingRes = await api.post('/bookings', {
                tripId: trip.id,
                date: trip.date,
                passengers: passengers
            });

            if (!bookingRes.data.booking?.id) {
                throw new Error('Failed to create booking');
            }

            const bookingId = bookingRes.data.booking.id;

            // 2. Process Payment
            const paymentDetails: any = {};
            if (paymentMethod === 'card') {
                paymentDetails.cardNumber = cardNumber.replace(/\s/g, '');
                paymentDetails.cardName = cardName;
                paymentDetails.expiryDate = expiryDate;
                paymentDetails.cvv = cvv;
            } else if (paymentMethod === 'mobile') {
                paymentDetails.phoneNumber = phoneNumber;
                paymentDetails.provider = 'orange'; // Default or add selector
            } else if (paymentMethod === 'bank') {
                paymentDetails.bankAccount = 'manual_transfer';
            }

            const paymentRes = await api.post('/payments/process', {
                bookingId,
                paymentMethod,
                paymentDetails
            });

            if (paymentRes.data.success) {
                setPaymentSuccess(true);
                // Redirect to tickets page after 2 seconds
                setTimeout(() => {
                    router.push('/tickets');
                }, 2000);
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
                        <p className="text-slate-600 mb-8">Your ticket has been booked successfully.</p>
                        <div className="bg-slate-50 rounded-lg p-6 mb-8">
                            <div className="text-sm text-slate-500 mb-2">Trip Details</div>
                            <div className="font-bold text-lg text-slate-900 mb-1">
                                {trip.departureStation} → {trip.arrivalStation}
                            </div>
                            <div className="text-slate-600 text-sm">
                                {new Date(trip.date).toLocaleDateString()} • {trip.departureTime}
                            </div>
                            <div className="mt-4 text-2xl font-bold text-green-600">
                                {totalPrice} DH
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
                    Back to Trip Details
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Trip Summary */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Trip Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-sm">
                                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Bus className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{trip.operator}</div>
                                        <div className="text-slate-500">Line {trip.lineNumber}</div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="h-2 w-2 rounded-full bg-blue-600 mt-2"></div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">{trip.departureTime}</div>
                                            <div className="text-sm text-slate-600">{trip.departureStation}</div>
                                        </div>
                                    </div>
                                    <div className="ml-1 border-l-2 border-dashed border-slate-200 h-8"></div>
                                    <div className="flex items-start gap-3">
                                        <div className="h-2 w-2 rounded-full bg-slate-900 mt-2"></div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-900">{trip.arrivalTime}</div>
                                            <div className="text-sm text-slate-600">{trip.arrivalStation}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(trip.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Clock className="h-4 w-4" />
                                        <span>{trip.duration}</span>
                                    </div>
                                </div>
                            </div>

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

                            <div className="border-t border-slate-100 pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-600">Price per ticket</span>
                                    <span className="font-medium text-slate-900">{trip.price} DH</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-600">Passengers</span>
                                    <span className="font-medium text-slate-900">×{passengers}</span>
                                </div>
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
