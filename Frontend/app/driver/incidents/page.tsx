'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Clock, CheckCircle2, CircleDashed } from 'lucide-react';

// Mock types
type Incident = {
    id: string;
    tripId: string;
    type: string;
    description: string;
    date: string;
    status: 'open' | 'resolved';
    line: { number: string };
};

export default function DriverIncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch incidents
        const mockIncidents: Incident[] = [
            {
                id: "I1",
                tripId: "T2",
                type: "Mechanical Issue",
                description: "Engine overheating warning light came on during uphill climb.",
                date: "2023-10-27T10:15:00",
                status: "open",
                line: { number: "102" }
            },
            {
                id: "I2",
                tripId: "T5",
                type: "Traffic Delay",
                description: "Heavy congestion due to road works on Main St.",
                date: "2023-10-20T08:30:00",
                status: "resolved",
                line: { number: "101" }
            }
        ];

        setTimeout(() => {
            setIncidents(mockIncidents);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Reported Incidents</h1>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading incidents...</div>
                    ) : incidents.map((incident) => (
                        <Card key={incident.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                                            {incident.type}
                                        </Badge>
                                        <span className="text-sm text-slate-500">Line {incident.line.number}</span>
                                    </div>
                                    <Badge variant={incident.status === 'open' ? 'default' : 'secondary'} className={incident.status === 'open' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-100 text-green-700'}>
                                        {incident.status === 'open' ? (
                                            <><CircleDashed className="w-3 h-3 mr-1" /> Open</>
                                        ) : (
                                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Resolved</>
                                        )}
                                    </Badge>
                                </div>
                                <CardTitle className="text-lg mt-2">Incident #{incident.id}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-slate-700 mb-4 bg-slate-50 p-3 rounded-md border border-slate-100">
                                    {incident.description}
                                </p>
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
