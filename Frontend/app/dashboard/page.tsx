'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, TrendingUp, CreditCard, Ticket, ArrowRight, Activity } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';

type DashboardData = {
    upcomingTrips: {
        ticketId: string;
        departureStation: string;
        arrivalStation: string;
        departureTime: string;
        date: string;
        lineNumber: string;
    }[];
    recentActivity: {
        type: 'booking' | 'exchange' | 'cancellation';
        description: string;
        timestamp: string;
    }[];
    quickStats: {
        tripsThisMonth: number;
        totalSpent: number;
        activeTickets: number;
    };
    recommendations: {
        popularRoutes: {
            from: string;
            to: string;
            count: number;
        }[];
        nearbyStations: {
            name: string;
            distance: number;
            coordinates: [number, number];
        }[];
    };
};

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/users/me/dashboard');
                setData(response.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                // Fallback mock data if API fails (for demo purposes)
                setData({
                    upcomingTrips: [],
                    recentActivity: [],
                    quickStats: { tripsThisMonth: 0, totalSpent: 0, activeTickets: 0 },
                    recommendations: { popularRoutes: [], nearbyStations: [] }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, router]);

    if (!user) return null;

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

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name.split(' ')[0]}!</h1>
                        <p className="text-slate-500">Here's what's happening with your transit.</p>
                    </div>
                    <Link href="/search">
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            Book a Trip
                        </Button>
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Trips this Month</p>
                                <h3 className="text-2xl font-bold text-slate-900">{data?.quickStats.tripsThisMonth || 0}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Total Spent</p>
                                <h3 className="text-2xl font-bold text-slate-900">${data?.quickStats.totalSpent || 0}</h3>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                <Ticket className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Active Tickets</p>
                                <h3 className="text-2xl font-bold text-slate-900">{data?.quickStats.activeTickets || 0}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Left Column */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Upcoming Trips */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Upcoming Trips</CardTitle>
                                    <CardDescription>Your next scheduled journeys</CardDescription>
                                </div>
                                <Link href="/tickets">
                                    <Button variant="ghost" size="sm" className="text-blue-600">View All</Button>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {data?.upcomingTrips && data.upcomingTrips.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.upcomingTrips.map((trip) => (
                                            <div key={trip.ticketId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {trip.lineNumber}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900">
                                                            {trip.departureStation} <span className="text-slate-400 mx-1">→</span> {trip.arrivalStation}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(trip.date).toLocaleDateString()}</span>
                                                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {trip.departureTime}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Link href={`/tickets/${trip.ticketId}`}>
                                                    <Button variant="outline" size="sm">Details</Button>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <p>No upcoming trips scheduled.</p>
                                        <Link href="/search">
                                            <Button variant="link" className="mt-2">Book a trip now</Button>
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Your latest transactions and updates</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data?.recentActivity && data.recentActivity.length > 0 ? (
                                    <div className="space-y-6">
                                        {data.recentActivity.map((activity, index) => (
                                            <div key={index} className="flex gap-4">
                                                <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${activity.type === 'booking' ? 'bg-green-500' :
                                                        activity.type === 'cancellation' ? 'bg-red-500' : 'bg-orange-500'
                                                    }`} />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">No recent activity.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Right Column */}
                    <div className="space-y-8">
                        {/* Popular Routes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Popular Routes</CardTitle>
                                <CardDescription>Routes you travel frequently</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data?.recommendations.popularRoutes && data.recommendations.popularRoutes.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.recommendations.popularRoutes.map((route, index) => (
                                            <Link
                                                key={index}
                                                href={`/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`}
                                                className="block p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <Badge variant="secondary" className="text-xs">{route.count} trips</Badge>
                                                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                                                </div>
                                                <div className="font-medium text-sm text-slate-900">{route.from}</div>
                                                <div className="text-xs text-slate-400 my-1">to</div>
                                                <div className="font-medium text-sm text-slate-900">{route.to}</div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-500">No travel history yet.</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Nearby Stations */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Nearby Stations</CardTitle>
                                <CardDescription>Stations close to your location</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {data?.recommendations.nearbyStations && data.recommendations.nearbyStations.length > 0 ? (
                                    <div className="space-y-4">
                                        {data.recommendations.nearbyStations.map((station, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                                                <div>
                                                    <div className="font-medium text-slate-900">{station.name}</div>
                                                    <div className="text-xs text-slate-500">{station.distance.toFixed(1)} km away</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-500">Location services unavailable.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

