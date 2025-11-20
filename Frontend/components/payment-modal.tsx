'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, CreditCard, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Trip = {
    id: string;
    lineNumber: string;
    operator: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
};

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: Trip[];
    total: number;
    travelDate: string;
}

export function PaymentModal({ isOpen, onClose, cartItems, total, travelDate }: PaymentModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<'payment' | 'success'>('payment');
    const [bookingReference, setBookingReference] = useState('');
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        email: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Generate booking reference
        const reference = `BK${Date.now().toString().slice(-8)}`;
        setBookingReference(reference);

        // Save tickets to localStorage
        const existingTickets = JSON.parse(localStorage.getItem('userTickets') || '[]');
        const newTickets = cartItems.map((item, index) => ({
            id: `${reference}-${index}`,
            bookingReference: reference,
            operator: item.operator,
            lineNumber: item.lineNumber,
            departureStation: item.departureStation,
            arrivalStation: item.arrivalStation,
            departureTime: item.departureTime,
            arrivalTime: item.arrivalTime,
            date: travelDate,
            price: item.price,
            passengers: 1,
            qrCodeUrl: '',
            exchangesRemaining: 3,
            status: 'active' as const
        }));

        localStorage.setItem('userTickets', JSON.stringify([...existingTickets, ...newTickets]));

        // Simulate payment processing
        setTimeout(() => {
            setStep('success');
        }, 1000);
    };

    const handleClose = () => {
        setStep('payment');
        setFormData({
            cardNumber: '',
            cardHolder: '',
            expiryDate: '',
            cvv: '',
            email: ''
        });
        onClose();
    };

    const handleDone = () => {
        handleClose();
        router.push('/tickets');
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        const chunks = cleaned.match(/.{1,4}/g);
        return chunks ? chunks.join(' ') : cleaned;
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s/g, '');
        if (value.length <= 16 && /^\d*$/.test(value)) {
            setFormData({ ...formData, cardNumber: value });
        }
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        if (value.length <= 5) {
            setFormData({ ...formData, expiryDate: value });
        }
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.length <= 3 && /^\d*$/.test(value)) {
            setFormData({ ...formData, cvv: value });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {step === 'payment' ? (
                    <>
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-2xl font-bold text-slate-900">Payment Details</h2>
                            <button
                                onClick={handleClose}
                                className="h-10 w-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-900 mb-3">Order Summary</h3>
                            <div className="space-y-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span className="text-slate-600">
                                            {item.operator} Line {item.lineNumber} • {item.departureStation} → {item.arrivalStation}
                                        </span>
                                        <span className="font-semibold text-slate-900">{item.price} DH</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-sm pt-2 border-t border-slate-300">
                                    <span className="text-slate-600">Travel Date</span>
                                    <span className="font-semibold text-slate-900">
                                        {new Date(travelDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-slate-300">
                                    <span className="font-bold text-slate-900">Total Amount</span>
                                    <span className="font-bold text-purple-700 text-lg">{total} DH</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <form onSubmit={handleSubmit} className="px-6 py-6">
                            <div className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email Address
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="your.email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full"
                                    />
                                </div>

                                {/* Card Number */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Card Number
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="1234 5678 9012 3456"
                                            value={formatCardNumber(formData.cardNumber)}
                                            onChange={handleCardNumberChange}
                                            required
                                            className="w-full pl-10"
                                        />
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    </div>
                                </div>

                                {/* Card Holder */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Cardholder Name
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="JOHN DOE"
                                        value={formData.cardHolder}
                                        onChange={(e) => setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() })}
                                        required
                                        className="w-full"
                                    />
                                </div>

                                {/* Expiry and CVV */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Expiry Date
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={formData.expiryDate}
                                            onChange={handleExpiryChange}
                                            required
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            CVV
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="123"
                                            value={formData.cvv}
                                            onChange={handleCvvChange}
                                            required
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                {/* Security Note */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800">
                                        🔒 Your payment information is encrypted and secure. We never store your card details.
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6 flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-purple-700 hover:bg-purple-800 text-white"
                                >
                                    Pay {total} DH
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <>
                        {/* Success Screen */}
                        <div className="px-6 py-12 text-center">
                            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <Check className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-3">Payment Successful!</h2>
                            <p className="text-slate-600 mb-8">
                                Your booking has been confirmed. A confirmation email has been sent to <strong>{formData.email}</strong>
                            </p>

                            {/* Booking Details */}
                            <div className="bg-slate-50 rounded-lg p-6 mb-6 text-left">
                                <h3 className="font-semibold text-slate-900 mb-4">Booking Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Booking Reference</span>
                                        <span className="font-mono font-semibold text-slate-900">
                                            {bookingReference}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Travel Date</span>
                                        <span className="font-semibold text-slate-900">
                                            {new Date(travelDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Number of Tickets</span>
                                        <span className="font-semibold text-slate-900">{cartItems.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-3 border-t border-slate-300">
                                        <span className="font-bold text-slate-900">Total Paid</span>
                                        <span className="font-bold text-green-600 text-lg">{total} DH</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleDone}
                                className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                            >
                                View My Tickets
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
