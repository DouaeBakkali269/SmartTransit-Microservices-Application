'use client';

import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Bus, AlertTriangle, TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function AdminDashboardPage() {
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
                            <div className="text-2xl font-bold">$45,231.89</div>
                            <p className="text-xs text-slate-500">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+2350</div>
                            <p className="text-xs text-slate-500">+180.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
                            <Bus className="h-4 w-4 text-slate-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-slate-500">+2 since last hour</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">3</div>
                            <p className="text-xs text-slate-500">+1 since last hour</p>
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
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                You made 265 sales this month.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                <div className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">New User Registered</p>
                                        <p className="text-xs text-slate-500">
                                            user@example.com
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-slate-500">+2m</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Ticket Purchased</p>
                                        <p className="text-xs text-slate-500">
                                            Line 101 - $2.50
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-slate-500">+5m</div>
                                </div>
                                <div className="flex items-center">
                                    <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">Incident Reported</p>
                                        <p className="text-xs text-slate-500">
                                            Mechanical Issue - Bus 102
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium text-xs text-slate-500">+15m</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
