'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, CreditCard, Star, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [subscription, setSubscription] = useState('basic');

    if (!user) return null;

    const plans = [
        {
            id: 'basic',
            name: 'Pay as you go',
            price: '$0',
            period: '/month',
            features: ['Pay per ride', 'Standard support', 'Digital tickets']
        },
        {
            id: 'monthly',
            name: 'Monthly Pass',
            price: '$49',
            period: '/month',
            features: ['Unlimited rides', 'Priority support', 'Digital tickets', 'Line updates']
        },
        {
            id: 'annual',
            name: 'Annual Saver',
            price: '$499',
            period: '/year',
            features: ['Unlimited rides', 'Priority support', 'Digital tickets', 'Line updates', '2 months free']
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* User Info Card */}
                    <div className="md:col-span-1">
                        <Card>
                            <CardHeader className="text-center">
                                <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <User className="h-12 w-12 text-blue-600" />
                                </div>
                                <CardTitle>{user.name}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                                <div className="mt-2">
                                    <Badge variant="secondary" className="capitalize">{user.role}</Badge>
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

                    {/* Subscription Section */}
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                    <CardTitle>Subscription Plan</CardTitle>
                                </div>
                                <CardDescription>Manage your travel subscription</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {plans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            className={`relative rounded-lg border p-4 cursor-pointer transition-all ${subscription === plan.id
                                                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                                                    : 'border-slate-200 hover:border-blue-300'
                                                }`}
                                            onClick={() => setSubscription(plan.id)}
                                        >
                                            {subscription === plan.id && (
                                                <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1">
                                                    <Check className="h-3 w-3" />
                                                </div>
                                            )}
                                            <h3 className="font-semibold text-slate-900">{plan.name}</h3>
                                            <div className="mt-2 mb-4">
                                                <span className="text-2xl font-bold">{plan.price}</span>
                                                <span className="text-xs text-slate-500">{plan.period}</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center text-xs text-slate-600">
                                                        <Check className="h-3 w-3 mr-1 text-green-500" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                <div className="text-sm text-slate-500">
                                    Current Plan: <span className="font-semibold text-slate-900 capitalize">{plans.find(p => p.id === subscription)?.name}</span>
                                </div>
                                <Button disabled={subscription === 'basic'}>Update Subscription</Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                    <CardTitle>Travel Stats</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="text-2xl font-bold text-slate-900">12</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Trips this month</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="text-2xl font-bold text-slate-900">450</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Km Traveled</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="text-2xl font-bold text-slate-900">$32</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Saved</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
