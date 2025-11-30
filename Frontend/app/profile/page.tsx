'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, CreditCard, Star, Check, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/axios';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [currentPlan, setCurrentPlan] = useState('basic');
    const [selectedPlan, setSelectedPlan] = useState('basic');
    const [isUpdating, setIsUpdating] = useState(false);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);
    const [stats, setStats] = useState({ tripsCount: 0, distanceTraveled: 0, moneySaved: 0 });
    const [plans, setPlans] = useState<any[]>([]);
    const [profileName, setProfileName] = useState('');

    useEffect(() => {
        if (user) {
            setProfileName(user.name);
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch plans
                const plansRes = await api.get('/subscriptions/plans');
                setPlans(plansRes.data.plans);

                // Fetch user subscription
                try {
                    const subRes = await api.get('/users/me/subscription');
                    if (subRes.data.subscription) {
                        setCurrentPlan(subRes.data.subscription.planId);
                        setSelectedPlan(subRes.data.subscription.planId);
                    }
                } catch (e) {
                    // Ignore if no subscription found (defaults to basic)
                }

                // Fetch stats
                try {
                    const statsRes = await api.get('/users/me/stats');
                    setStats(statsRes.data.stats);
                } catch (e) {
                    // Ignore stats error
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };
        fetchData();
    }, []);

    const handleUpdateSubscription = async () => {
        setIsUpdating(true);
        try {
            await api.post('/subscriptions/change', {
                planId: selectedPlan,
                paymentMethod: 'default' // Simplified for now
            });
            setCurrentPlan(selectedPlan);
            setShowSuccessBanner(true);
            setTimeout(() => setShowSuccessBanner(false), 4000);
        } catch (error) {
            console.error("Error updating subscription:", error);
            alert("Failed to update subscription.");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const res = await api.put('/users/me', {
                name: profileName
            });
            // Update local user context
            if (user && updateUser) {
                updateUser({ name: profileName });
            }
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile.");
        }
    };

    if (!user) return null;

    // Default plans if API fails or returns empty
    const displayPlans = plans.length > 0 ? plans : [
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

            {/* Success Banner */}
            {showSuccessBanner && (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                    <div className="bg-green-100 border border-green-200 text-green-800 rounded-lg p-4 flex items-center gap-3 shadow-sm">
                        <div className="flex-shrink-0">
                            <Check className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">Subscription updated successfully!</p>
                            <p className="text-sm text-green-700">Your new plan is now active.</p>
                        </div>
                        <button
                            onClick={() => setShowSuccessBanner(false)}
                            className="flex-shrink-0 text-green-600 hover:text-green-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">My Profile</h1>

                <div className={`grid gap-8 ${user.role === 'user' ? 'md:grid-cols-3' : 'max-w-md mx-auto'}`}>
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
                                        <Input
                                            id="name"
                                            value={profileName}
                                            onChange={(e) => setProfileName(e.target.value)}
                                            disabled={!isEditing}
                                            className="pl-9"
                                        />
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
                                    onClick={() => {
                                        if (isEditing) {
                                            handleSaveProfile();
                                        } else {
                                            setIsEditing(true);
                                        }
                                    }}
                                >
                                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Subscription Section - Only for Users */}
                    {user.role === 'user' && (
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
                                        {displayPlans.map((plan) => (
                                            <div
                                                key={plan.id}
                                                className={`relative rounded-lg border p-4 cursor-pointer transition-all ${selectedPlan === plan.id
                                                    ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                                                    : 'border-slate-200 hover:border-blue-300'
                                                    }`}
                                                onClick={() => setSelectedPlan(plan.id)}
                                            >
                                                {selectedPlan === plan.id && (
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
                                                    {plan.features.map((feature: string, i: number) => (
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
                                        Current Plan: <span className="font-semibold text-slate-900 capitalize">{displayPlans.find(p => p.id === currentPlan)?.name}</span>
                                    </div>
                                    <Button
                                        onClick={handleUpdateSubscription}
                                        disabled={selectedPlan === currentPlan || isUpdating}
                                    >
                                        {isUpdating ? 'Updating...' : 'Update Subscription'}
                                    </Button>
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
                                            <div className="text-2xl font-bold text-slate-900">{stats.tripsCount}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Trips this month</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-900">{stats.distanceTraveled}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Km Traveled</div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-900">${stats.moneySaved}</div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Saved</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}
