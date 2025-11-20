'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bus, MapPin, Clock, Calendar, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

// Mock types
type Trip = {
    id: string;
    lineId: string;
    startTime: string;
    endTime: string;
    delay: number;
    line?: {
        id: string;
        number: string;
        name: string;
        stations: string[];
    };
    price: number;
};

export default function TripDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

    useEffect(() => {
        // Mock fetch trip details
        const mockTrip = {
            id: params.id as string,
            lineId: "L1",
            startTime: "2023-10-27T08:00:00",
            endTime: "2023-10-27T09:00:00",
            delay: 0,
            line: {
                id: "L1",
                number: "101",
                name: "Downtown - Airport",
                stations: ["Central Station", "Market Square", "City Park", "Airport Terminal 1"]
            },
            price: 2.50
        };

        setTimeout(() => {
            setTrip(mockTrip);
            setLoading(false);
        }, 500);
    }, [params.id]);

    const handleBuyTicket = () => {
        setBookingStatus('processing');
        // Mock API call to buy ticket
        setTimeout(() => {
            setBookingStatus('success');
            // In real app, we would redirect to ticket details or show success message
        }, 1500);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (!trip) return <div>Trip not found</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href="/results" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Results
                </Link>

                {bookingStatus === 'success' ? (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-10 w-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-green-900 mb-2">Ticket Purchased Successfully!</h2>
                            <p className="text-green-700 mb-6">Your ticket has been added to your account.</p>
                            <div className="flex justify-center gap-4">
                                <Link href="/tickets">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white">View My Tickets</Button>
                                </Link>
                                <Link href="/search">
                                    <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-100">Book Another Trip</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        <Card className="overflow-hidden border-slate-200 shadow-sm">
                            <div className="bg-slate-900 p-6 text-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <Badge className="bg-blue-500 text-white hover:bg-blue-600 text-lg px-3 py-1">
                                                Line {trip.line?.number}
                                            </Badge>
                                            <h1 className="text-xl font-bold">{trip.line?.name}</h1>
                                        </div>
                                        <div className="flex items-center text-slate-300 text-sm">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(trip.startTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold">${trip.price.toFixed(2)}</div>
                                        <div className="text-slate-400 text-sm">per person</div>
                                    </div>
                                </div>
                            </div>

                            <CardContent className="p-6">
                                <div className="relative pl-8 border-l-2 border-slate-200 space-y-8 my-4">
                                    {trip.line?.stations.map((station, index) => {
                                        const isStart = index === 0;
                                        const isEnd = index === trip.line!.stations.length - 1;

                                        return (
                                            <div key={station} className="relative">
                                                <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white ${isStart ? 'bg-blue-500' : isEnd ? 'bg-red-500' : 'bg-slate-300'} shadow-sm`}></div>
                                                <div className="flex justify-between items-center">
                                                    <span className={`font-medium ${isStart || isEnd ? 'text-slate-900 text-lg' : 'text-slate-500'}`}>
                                                        {station}
                                                    </span>
                                                    {(isStart || isEnd) && (
                                                        <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                            {isStart ? new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                                                isEnd ? new Date(trip.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-8 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-blue-900 text-sm">Trip Information</h4>
                                        <p className="text-blue-700 text-sm mt-1">
                                            This trip is operated by TransitMA. Please arrive at the station 5 minutes before departure.
                                            Digital tickets are accepted on all buses.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
                                <div className="text-sm text-slate-500">
                                    Total for 1 passenger: <span className="font-bold text-slate-900">${trip.price.toFixed(2)}</span>
                                </div>
                                <Button
                                    onClick={handleBuyTicket}
                                    disabled={bookingStatus === 'processing'}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-lg shadow-lg shadow-blue-200"
                                >
                                    {bookingStatus === 'processing' ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <CreditCard className="mr-2 h-5 w-5" />
                                            Buy Ticket
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
