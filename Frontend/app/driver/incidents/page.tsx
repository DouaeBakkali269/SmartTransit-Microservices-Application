'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Clock, CheckCircle2, CircleDashed, Search } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/lib/auth-context';

type Incident = {
    id: string;
    tripId: string;
    type: string;
    description: string;
    date: string;
    status: 'open' | 'investigating' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    line: {
        number: string;
        name: string;
    };
    bus: {
        id: string;
        number: string;
    };
    adminNotes?: string;
};

export default function DriverIncidentsPage() {
    const { user } = useAuth();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const response = await api.get('/driver/incidents');
                setIncidents(response.data.incidents || []);
            } catch (error) {
                console.error("Error fetching incidents:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'driver') {
            fetchIncidents();
        }
    }, [user]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return (
                    <Badge className="bg-red-500 hover:bg-red-600">
                        <CircleDashed className="w-3 h-3 mr-1" /> Open
                    </Badge>
                );
            case 'investigating':
                return (
                    <Badge className="bg-orange-500 hover:bg-orange-600">
                        <Search className="w-3 h-3 mr-1" /> Investigating
                    </Badge>
                );
            case 'resolved':
                return (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Resolved
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Reported Incidents</h1>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading incidents...</div>
                    ) : incidents.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">No incidents reported.</div>
                    ) : incidents.map((incident) => (
                        <Card key={incident.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                                            {incident.type}
                                        </Badge>
                                        <span className="text-sm text-slate-500">Line {incident.line.number} • Bus {incident.bus.number}</span>
                                    </div>
                                    {getStatusBadge(incident.status)}
                                </div>
                                <CardTitle className="text-lg mt-2">Incident #{incident.id}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 mb-4 bg-slate-50 p-3 rounded-md border border-slate-100">
                                    {incident.description}
                                </p>
                                {incident.adminNotes && (
                                    <div className="mb-4 bg-blue-50 p-3 rounded-md border border-blue-100 text-sm">
                                        <span className="font-semibold text-blue-800 block mb-1">Admin Notes:</span>
                                        <p className="text-blue-700">{incident.adminNotes}</p>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {new Date(incident.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {new Date(incident.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
