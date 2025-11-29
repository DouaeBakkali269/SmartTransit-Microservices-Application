'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/lib/auth-context';

type Trip = {
    id: string;
    lineId: string;
    startTime: string;
    endTime: string;
    status: 'completed' | 'cancelled';
    line: {
        number: string;
        name: string;
        color?: string;
    };
    delay: number;
    passengerCount?: number;
    distance?: number;
    duration?: number;
};

export default function DriverHistoryPage() {
    const { user } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get('/driver/trips/history');
                setTrips(response.data.trips || []);
            } catch (error) {
                console.error("Error fetching trip history:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'driver') {
            fetchHistory();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Trip History</h1>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading history...</div>
                    ) : trips.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">No trip history found.</div>
                    ) : trips.map((trip) => (
                        <Card key={trip.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-full ${trip.status === 'completed' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            {trip.status === 'completed' ? (
                                                <CheckCircle className={`h-6 w-6 ${trip.status === 'completed' ? 'text-green-600' : 'text-red-600'}`} />
                                            ) : (
                                                <XCircle className="h-6 w-6 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className="bg-blue-600">{trip.line.number}</Badge>
                                                <span className="font-bold text-lg text-slate-900">{trip.line.name}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-500 gap-4">
                                                <div className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {new Date(trip.startTime).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {trip.endTime ? new Date(trip.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <Badge variant={trip.status === 'completed' ? 'outline' : 'destructive'} className={trip.status === 'completed' ? 'text-green-600 border-green-200 bg-green-50' : ''}>
                                            {trip.status === 'completed' ? 'Completed' : 'Cancelled'}
                                        </Badge>
                                        {trip.delay > 0 && (
                                            <span className="text-xs font-bold text-red-500">+{trip.delay} min delay</span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
