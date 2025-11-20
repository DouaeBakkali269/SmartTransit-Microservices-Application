'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, AlertTriangle, Fuel, Gauge, Thermometer, Navigation, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// Mock types
type Trip = {
    id: string;
    lineId: string;
    startTime: string;
    endTime: string;
    currentStation: string;
    nextStation: string;
    delay: number;
    status: 'scheduled' | 'in-progress' | 'completed';
    line: { number: string; name: string };
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

    useEffect(() => {
        // Mock fetch current trip
        const mockTrip: Trip = {
            id: "T2",
            lineId: "L2",
            startTime: "2023-10-27T10:00:00",
            endTime: "2023-10-27T11:00:00",
            currentStation: "Library",
            nextStation: "Tech Park",
            delay: 5,
            status: "in-progress",
            line: { number: "102", name: "University - Mall" }
        };

        const mockMetrics: VehicleMetrics = {
            fuelLevel: 75,
            autonomy: 450,
            engineStatus: "Good",
            temperature: 85
        };

        setTimeout(() => {
            setTrip(mockTrip);
            setMetrics(mockMetrics);
            setLoading(false);
        }, 500);
    }, []);

    const handleReportIncident = (e: React.FormEvent) => {
        e.preventDefault();
        setIncidentOpen(false);
        alert("Incident reported successfully");
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

    if (!trip || !metrics) return <div>No active trip</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Current Trip</h1>
                        <p className="text-slate-500 mt-1">
                            Line {trip.line.number}: {trip.line.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant={trip.delay > 0 ? "destructive" : "secondary"} className="text-lg px-4 py-1">
                            {trip.delay > 0 ? `+${trip.delay} min Delay` : "On Time"}
                        </Badge>
                        <Badge className="bg-green-500 text-lg px-4 py-1 animate-pulse">
                            Live
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Trip Status */}
                    <div className="md:col-span-2 space-y-6">
                        <Card className="border-blue-200 bg-blue-50/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Navigation className="h-5 w-5 text-blue-600" />
                                    Route Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between mb-8 relative">
                                    <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-200 -z-10"></div>

                                    <div className="flex flex-col items-center z-10">
                                        <div className="h-4 w-4 rounded-full bg-green-500 ring-4 ring-white"></div>
                                        <span className="mt-2 text-xs font-medium text-slate-500">Prev: University</span>
                                    </div>

                                    <div className="flex flex-col items-center z-10">
                                        <div className="h-8 w-8 rounded-full bg-blue-600 ring-4 ring-white flex items-center justify-center shadow-lg">
                                            <MapPin className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="mt-2 text-sm font-bold text-blue-900">{trip.currentStation}</span>
                                        <span className="text-xs text-blue-600 font-medium">Current Stop</span>
                                    </div>

                                    <div className="flex flex-col items-center z-10 opacity-50">
                                        <div className="h-4 w-4 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                        <span className="mt-2 text-xs font-medium text-slate-500">Next: {trip.nextStation}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                        <div className="text-sm text-slate-500 mb-1">Next Stop Arrival</div>
                                        <div className="text-2xl font-bold text-slate-900">3 min</div>
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                                        <div className="text-sm text-slate-500 mb-1">Distance to End</div>
                                        <div className="text-2xl font-bold text-slate-900">4.2 km</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Button className="h-16 text-lg bg-slate-900 hover:bg-slate-800">
                                <CheckCircle className="mr-2 h-6 w-6" />
                                Arrived at Station
                            </Button>
                            <Dialog open={incidentOpen} onOpenChange={setIncidentOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="h-16 text-lg bg-red-600 hover:bg-red-700">
                                        <AlertTriangle className="mr-2 h-6 w-6" />
                                        Report Incident
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Report an Incident</DialogTitle>
                                        <DialogDescription>
                                            Please provide details about the incident. This will be sent to the control center immediately.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleReportIncident}>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="type">Incident Type</Label>
                                                <Select required>
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
                                                <Textarea id="description" placeholder="Describe what happened..." required />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" variant="destructive">Submit Report</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Vehicle Metrics */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Vehicle Status</CardTitle>
                                <CardDescription>Bus ID: {user?.id === '2' ? 'BUS-101' : 'Unknown'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center text-sm font-medium text-slate-700">
                                            <Fuel className="mr-2 h-4 w-4 text-slate-500" />
                                            Fuel Level
                                        </div>
                                        <span className="text-sm font-bold">{metrics.fuelLevel}%</span>
                                    </div>
                                    <Progress value={metrics.fuelLevel} className="h-2" />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center text-sm font-medium text-slate-700">
                                            <Gauge className="mr-2 h-4 w-4 text-slate-500" />
                                            Autonomy
                                        </div>
                                        <span className="text-sm font-bold">{metrics.autonomy} km</span>
                                    </div>
                                    <Progress value={70} className="h-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                        <div className="flex justify-center mb-2">
                                            <Thermometer className={`h-5 w-5 ${metrics.temperature > 90 ? 'text-red-500' : 'text-green-500'}`} />
                                        </div>
                                        <div className="text-lg font-bold">{metrics.temperature}°C</div>
                                        <div className="text-xs text-slate-500">Engine Temp</div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                        <div className="flex justify-center mb-2">
                                            <CheckCircle className={`h-5 w-5 ${metrics.engineStatus === 'Good' ? 'text-green-500' : 'text-yellow-500'}`} />
                                        </div>
                                        <div className="text-lg font-bold">{metrics.engineStatus}</div>
                                        <div className="text-xs text-slate-500">Engine Status</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-slate-500">Today's Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-700">Trips Completed</span>
                                        <span className="font-bold">3</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-700">On Time Rate</span>
                                        <span className="font-bold text-green-600">95%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-700">Hours Driven</span>
                                        <span className="font-bold">4.5h</span>
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
