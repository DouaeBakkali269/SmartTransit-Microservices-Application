'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Award, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function DriverProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);

    if (!user) return null;

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
                                <CardTitle>{user.name}</CardTitle>
                                <CardDescription>ID: DRV-002</CardDescription>
                                <div className="mt-2">
                                    <Badge className="bg-green-600 hover:bg-green-700">Active Driver</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input id="name" defaultValue={user.name} disabled={!isEditing} className="pl-9" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input id="email" defaultValue={user.email} disabled className="pl-9 bg-slate-50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input id="phone" defaultValue="+1 (555) 123-4567" disabled={!isEditing} className="pl-9" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    variant={isEditing ? "default" : "outline"}
                                    className="w-full"
                                    onClick={() => setIsEditing(!isEditing)}
                                >
                                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                                </Button>
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
                                            <circle cx="80" cy="80" r="70" stroke="#22c55e" strokeWidth="12" fill="none" strokeDasharray="440" strokeDashoffset="44" strokeLinecap="round" />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <span className="text-4xl font-bold text-slate-900">9.0</span>
                                            <span className="text-sm text-slate-500">/ 10</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-center mt-4">
                                    <div>
                                        <div className="text-sm text-slate-500">Punctuality</div>
                                        <div className="font-bold text-slate-900">95%</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500">Safety</div>
                                        <div className="font-bold text-slate-900">98%</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500">Customer Rating</div>
                                        <div className="font-bold text-slate-900">4.8</div>
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
                                        <div className="text-2xl font-bold text-slate-900">1,240</div>
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
                                        <div className="text-2xl font-bold text-slate-900">Gold</div>
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
