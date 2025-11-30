'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Award, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/axios';

type DriverProfile = {
    id: string;
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    status: 'active' | 'inactive';
    driverId: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
    createdAt: string;
};

type Performance = {
    score: number;
    punctuality: number;
    safety: number;
    customerRating: number;
    totalTrips: number;
    onTimeTrips: number;
    totalDistance: number;
    totalPassengers: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
};

type Stats = {
    totalKmDriven: number;
    totalTrips: number;
    totalPassengers: number;
    averageRating: number;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
};

export default function DriverProfilePage() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [performance, setPerformance] = useState<Performance | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        phone: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, performanceRes, statsRes] = await Promise.all([
                    api.get('/driver/profile'),
                    api.get('/driver/performance'),
                    api.get('/driver/stats')
                ]);

                setProfile(profileRes.data.driver);
                setPerformance(performanceRes.data.performance);
                setStats(statsRes.data.stats);
                setFormData({
                    name: profileRes.data.driver.name,
                    phone: profileRes.data.driver.phone || ''
                });
            } catch (error) {
                console.error("Error fetching driver data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'driver') {
            fetchData();
        }
    }, [user]);

    const handleSave = async () => {
        try {
            const response = await api.put('/driver/profile', formData);
            setProfile(response.data.driver);
            updateUser({
                name: response.data.driver.name,
                phone: response.data.driver.phone
            });
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };

    if (!user) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <p className="text-slate-500 font-medium">Loading Profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Driver Profile</h1>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* User Info Card */}
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader className="text-center">
                                <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <User className="h-12 w-12 text-green-600" />
                                </div>
                                <CardTitle>{profile?.name}</CardTitle>
                                <CardDescription>ID: {profile?.driverId}</CardDescription>
                                <div className="mt-2">
                                    <Badge className="bg-green-600 hover:bg-green-700">Active Driver</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={!isEditing}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input id="email" value={profile?.email} disabled className="pl-9 bg-slate-50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            disabled={!isEditing}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {isEditing ? (
                                    <div className="flex gap-2 w-full">
                                        <Button variant="outline" className="flex-1" onClick={() => {
                                            setIsEditing(false);
                                            setFormData({
                                                name: profile?.name || '',
                                                phone: profile?.phone || ''
                                            });
                                        }}>Cancel</Button>
                                        <Button className="flex-1" onClick={handleSave}>Save</Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Profile
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Stats Section */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-500" />
                                    <CardTitle>Performance Score</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-center py-6">
                                    <div className="relative h-40 w-40 flex items-center justify-center">
                                        <svg className="h-full w-full transform -rotate-90">
                                            <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                                            <circle
                                                cx="80" cy="80" r="70"
                                                stroke="#22c55e" strokeWidth="12" fill="none"
                                                strokeDasharray="440"
                                                strokeDashoffset={440 - (440 * (performance?.score || 0)) / 10}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-4xl font-bold text-slate-900">{performance?.score || 0}</span>
                                            <span className="text-sm text-slate-500">/ 10</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center mt-4">
                                    <div>
                                        <div className="text-sm text-slate-500">Punctuality</div>
                                        <div className="font-bold text-slate-900">{performance?.punctuality || 0}%</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500">Safety</div>
                                        <div className="font-bold text-slate-900">{performance?.safety || 0}%</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500">Customer Rating</div>
                                        <div className="font-bold text-slate-900">{performance?.customerRating || 0}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-6">
                            <Card>
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-900">{stats?.totalKmDriven || 0}</div>
                                        <div className="text-xs text-slate-500">Total Km Driven</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <Star className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-900">{profile?.tier || 'Bronze'}</div>
                                        <div className="text-xs text-slate-500">Driver Tier</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
