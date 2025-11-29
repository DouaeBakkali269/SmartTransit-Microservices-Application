'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Bus, AlertTriangle, TrendingUp, DollarSign, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

type AdminDashboardData = {
    overview: {
        totalRevenue: {
            amount: number;
            currency: string;
            change: number;
            changeType: 'increase' | 'decrease';
            period: string;
        };
        activeUsers: {
            count: number;
            change: number;
            changeType: 'increase' | 'decrease';
            period: string;
        };
        activeTrips: {
            count: number;
            change: number;
            changeType: 'increase' | 'decrease';
            period: string;
        };
        activeIncidents: {
            count: number;
            change: number;
            changeType: 'increase' | 'decrease';
            period: string;
        };
    };
    recentActivity: {
        type: 'user_registered' | 'ticket_purchased' | 'incident_reported' | 'driver_assigned';
        description: string;
        timestamp: string;
        metadata: any;
    }[];
    charts: {
        revenueByDay: { date: string; amount: number }[];
        tripsByLine: { lineNumber: string; count: number; revenue: number }[];
        userGrowth: { date: string; count: number }[];
    };
};

export default function AdminDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            // In a real app, we'd redirect non-admins
            // router.push('/login');
            // But for now, we'll allow it or just show loading
        }

        const fetchDashboardData = async () => {
            try {
                const response = await api.get('/admin/dashboard');
                setData(response.data);
            } catch (error) {
                console.error("Error fetching admin dashboard data:", error);
                // Fallback mock data
                setData({
                    overview: {
                        totalRevenue: { amount: 45231.89, currency: 'DH', change: 20.1, changeType: 'increase', period: 'last month' },
                        activeUsers: { count: 2350, change: 180.1, changeType: 'increase', period: 'last month' },
                        activeTrips: { count: 12, change: 2, changeType: 'increase', period: 'last hour' },
                        activeIncidents: { count: 3, change: 1, changeType: 'increase', period: 'last hour' }
                    },
                    recentActivity: [
                        { type: 'user_registered', description: 'New User Registered', timestamp: new Date().toISOString(), metadata: { email: 'user@example.com' } },
                        { type: 'ticket_purchased', description: 'Ticket Purchased', timestamp: new Date().toISOString(), metadata: { lineNumber: '101', amount: 2.50 } },
                        { type: 'incident_reported', description: 'Incident Reported', timestamp: new Date().toISOString(), metadata: { description: 'Mechanical Issue - Bus 102' } }
                    ],
                    charts: {
                        revenueByDay: [],
                        tripsByLine: [],
                        userGrowth: []
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

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

    if (!data) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Admin Dashboard</h1>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.overview.totalRevenue.currency} {data.overview.totalRevenue.amount.toLocaleString()}</div>
                            <p className={`text-xs flex items-center ${data.overview.totalRevenue.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                {data.overview.totalRevenue.changeType === 'increase' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                                {data.overview.totalRevenue.change}% from {data.overview.totalRevenue.period}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.overview.activeUsers.count.toLocaleString()}</div>
                            <p className={`text-xs flex items-center ${data.overview.activeUsers.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                {data.overview.activeUsers.changeType === 'increase' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                                {data.overview.activeUsers.change}% from {data.overview.activeUsers.period}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
                            <Bus className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.overview.activeTrips.count}</div>
                            <p className={`text-xs flex items-center ${data.overview.activeTrips.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                                {data.overview.activeTrips.changeType === 'increase' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                                {data.overview.activeTrips.change} since {data.overview.activeTrips.period}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{data.overview.activeIncidents.count}</div>
                            <p className={`text-xs flex items-center ${data.overview.activeIncidents.changeType === 'decrease' ? 'text-green-600' : 'text-red-600'}`}>
                                {data.overview.activeIncidents.changeType === 'increase' ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                                {data.overview.activeIncidents.change} since {data.overview.activeIncidents.period}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[350px] flex items-center justify-center bg-slate-50 rounded-md border border-dashed border-slate-200">
                                <div className="text-center">
                                    <Activity className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500">Revenue Chart Placeholder</p>
                                    <p className="text-xs text-slate-400 mt-1">(Chart library not installed)</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Latest system events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {data.recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ${activity.type === 'user_registered' ? 'bg-blue-100 text-blue-600' :
                                                activity.type === 'ticket_purchased' ? 'bg-green-100 text-green-600' :
                                                    activity.type === 'incident_reported' ? 'bg-red-100 text-red-600' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {activity.type === 'user_registered' && <Users className="h-5 w-5" />}
                                            {activity.type === 'ticket_purchased' && <DollarSign className="h-5 w-5" />}
                                            {activity.type === 'incident_reported' && <AlertTriangle className="h-5 w-5" />}
                                            {activity.type === 'driver_assigned' && <Bus className="h-5 w-5" />}
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{activity.description}</p>
                                            <p className="text-xs text-slate-500">
                                                {activity.metadata.email ||
                                                    (activity.metadata.lineNumber ? `Line ${activity.metadata.lineNumber} - $${activity.metadata.amount}` : '') ||
                                                    activity.metadata.description ||
                                                    new Date(activity.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-xs text-slate-500">
                                            {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
