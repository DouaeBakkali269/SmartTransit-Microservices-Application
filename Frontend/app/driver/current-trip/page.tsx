'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, AlertTriangle, Fuel, Gauge, Thermometer, CheckCircle, Clock, Navigation } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import dynamic from 'next/dynamic';
import api from '@/lib/axios';

// Dynamically import the map
const DriverNavigationMap = dynamic(() => import('@/components/driver-navigation-map').then(mod => ({ default: mod.DriverNavigationMap })), { ssr: false });

// Types
type Station = {
    id: string;
    name: string;
    coordinates: [number, number];
    order: number;
    estimatedArrival?: string;
};

type Trip = {
    id: string;
    lineId: string;
    startTime: string;
    endTime: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    currentStation: Station;
    nextStation: Station;
    delay: number;
    status: 'scheduled' | 'boarding' | 'in-transit' | 'completed';
    line: {
        number: string;
        name: string;
        color?: string;
    };
    vehicleId: string;
};

type VehicleMetrics = {
    fuelLevel: number;
    autonomy: number;
    engineStatus: 'Good' | 'Warning' | 'Critical';
    temperature: number;
};

export default function CurrentTripPage() {
    const { user } = useAuth();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [metrics, setMetrics] = useState<VehicleMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [incidentOpen, setIncidentOpen] = useState(false);
    const [incidentData, setIncidentData] = useState({
        type: '',
        description: ''
    });

    // Mock coordinates for the map (fallback)
    const driverLocation: [number, number] = [33.9860, -6.8650]; // Somewhere in Rabat

    useEffect(() => {
        const fetchTripData = async () => {
            try {
                const response = await api.get('/driver/trips/current');
                setTrip(response.data.trip);

                if (response.data.trip?.vehicleId) {
                    const metricsRes = await api.get(`/driver/vehicles/${response.data.trip.vehicleId}/metrics`);
                    setMetrics(metricsRes.data.metrics);
                } else {
                    // Fallback mock metrics if no vehicle assigned or API fails
                    setMetrics({
                        fuelLevel: 75,
                        autonomy: 450,
                        engineStatus: "Good",
                        temperature: 85
                    });
                }
            } catch (error) {
                console.error("Error fetching trip data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'driver') {
            fetchTripData();
        }
    }, [user]);

    const handleReportIncident = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trip) return;

        try {
            await api.post('/driver/incidents', {
                tripId: trip.id,
                type: incidentData.type,
                description: incidentData.description,
                priority: 'medium', // Default priority
                location: {
                    coordinates: driverLocation, // Should use real GPS
                    address: "Current Location"
                }
            });
            setIncidentOpen(false);
            setIncidentData({ type: '', description: '' });
            alert("Incident reported successfully. Control center notified.");
        } catch (error) {
            console.error("Error reporting incident:", error);
            alert("Failed to report incident.");
        }
    };

    const handleArrival = async () => {
        if (!trip) return;

        try {
            // Assuming arriving at next station
            await api.post(`/driver/trips/${trip.id}/arrival`, {
                stationId: trip.nextStation.id,
                actualArrivalTime: new Date().toISOString(),
                passengerCount: 0 // Placeholder
            });

            // Refresh trip data
            const response = await api.get('/driver/trips/current');
            setTrip(response.data.trip);
        } catch (error) {
            console.error("Error updating arrival:", error);
            alert("Failed to update arrival status.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-slate-500 font-medium">Loading Trip Data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!trip || !metrics) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="flex justify-center items-center h-[calc(100vh-64px)]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900">No Active Trip</h2>
                    <p className="text-slate-500 mt-2">You don't have any scheduled trips right now.</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-sm px-3 py-1">
                                Line {trip.line.number}
                            </Badge>
                            <span className="text-lg font-bold text-slate-900">{trip.line.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>Started at {new Date(trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="mx-1">•</span>
                            <span>Bus ID: {trip.vehicleId || 'Unknown'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${trip.delay > 0 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                            <div className={`w-2 h-2 rounded-full ${trip.delay > 0 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                            <span className="font-semibold text-sm">
                                {trip.delay > 0 ? `+${trip.delay} min Delay` : "On Time"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)] min-h-[600px]">

                    {/* Left Column: Controls & Stats */}
                    <div className="lg:col-span-1 flex flex-col gap-6 h-full overflow-y-auto pr-1">

                        {/* Next Stop Card */}
                        <Card className="border-0 shadow-md bg-white overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">Next Station</p>
                                        <h2 className="text-2xl font-bold text-slate-900">{trip.nextStation?.name || 'End of Line'}</h2>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-2">
                                    <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                        <span className="block text-xs text-slate-500">ETA</span>
                                        <span className="font-bold text-slate-900">
                                            {trip.nextStation?.estimatedArrival
                                                ? Math.ceil((new Date(trip.nextStation.estimatedArrival).getTime() - new Date().getTime()) / 60000) + ' min'
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                        <span className="block text-xs text-slate-500">Distance</span>
                                        <span className="font-bold text-slate-900">-- km</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleArrival}
                                    className="w-full mt-6 bg-slate-900 hover:bg-slate-800 h-12 text-base shadow-lg shadow-slate-900/10 transition-all hover:translate-y-[-1px]"
                                >
                                    <CheckCircle className="mr-2 h-5 w-5" />
                                    Arrived at Station
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Vehicle Status */}
                        <Card className="border-0 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold">Vehicle Health</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="flex items-center text-slate-600"><Fuel className="w-4 h-4 mr-2" /> Fuel</span>
                                        <span className="font-medium">{metrics.fuelLevel}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-800 rounded-full" style={{ width: `${metrics.fuelLevel}%` }}></div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                        <Thermometer className={`h-5 w-5 mb-1 ${metrics.temperature > 90 ? 'text-red-500' : 'text-green-500'}`} />
                                        <span className="text-lg font-bold text-slate-900">{metrics.temperature}°C</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Temp</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                                        <Gauge className="h-5 w-5 mb-1 text-blue-500" />
                                        <span className="text-lg font-bold text-slate-900">{metrics.autonomy}</span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">km left</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Incident Button */}
                        <Dialog open={incidentOpen} onOpenChange={setIncidentOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="w-full h-12 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm hover:shadow-md transition-all">
                                    <AlertTriangle className="mr-2 h-5 w-5" />
                                    Report Issue
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Report an Incident</DialogTitle>
                                    <DialogDescription>
                                        Alert the control center about an issue on the route.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleReportIncident}>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Incident Type</Label>
                                            <Select
                                                required
                                                onValueChange={(val) => setIncidentData({ ...incidentData, type: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="mechanical">Mechanical Issue</SelectItem>
                                                    <SelectItem value="accident">Accident</SelectItem>
                                                    <SelectItem value="passenger">Passenger Issue</SelectItem>
                                                    <SelectItem value="traffic">Heavy Traffic</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Describe what happened..."
                                                required
                                                className="min-h-[100px]"
                                                value={incidentData.description}
                                                onChange={(e) => setIncidentData({ ...incidentData, description: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" variant="destructive">Send Alert</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Right Column: Map */}
                    <div className="lg:col-span-2 h-full min-h-[400px]">
                        <Card className="h-full border-0 shadow-lg overflow-hidden relative">
                            <DriverNavigationMap
                                driverLocation={driverLocation}
                                nextStation={{
                                    name: trip.nextStation?.name || 'Unknown',
                                    coordinates: trip.nextStation?.coordinates || [0, 0]
                                }}
                            />

                            {/* Map Badge */}
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-[400] flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                <span className="text-xs font-bold text-slate-700">GPS Active</span>
                            </div>
                        </Card>
                    </div>

                </div>
            </main>
        </div>
    );
}
