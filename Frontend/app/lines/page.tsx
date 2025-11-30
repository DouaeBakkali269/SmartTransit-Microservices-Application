'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';

type Line = {
    id: string;
    number: string;
    name: string;
    color: string;
    schedule: string;
    status: 'active' | 'inactive';
    startStation: {
        name: string;
        coordinates: [number, number];
    };
    endStation: {
        name: string;
        coordinates: [number, number];
    };
    stationCount: number;
    estimatedDuration: number;
    price: number;
};

export default function LinesPage() {
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLines = async () => {
            try {
                const response = await api.get('/lines');
                setLines(response.data.lines || []);
            } catch (error) {
                console.error("Error fetching lines:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLines();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Bus Lines</h1>
                <p className="text-slate-500 mb-8">View all available bus routes and schedules.</p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : lines.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500">No lines available.</div>
                    ) : lines.map((line) => (
                        <Card key={line.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge className="text-lg px-3 py-1" style={{ backgroundColor: line.color || '#2563eb' }}>
                                        {line.number}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1 text-slate-600">
                                        <Clock className="h-3 w-3" />
                                        {line.schedule}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-2 text-xl">{line.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 mt-2">
                                    <div className="flex items-center text-sm text-slate-600">
                                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                        <span className="font-medium">Start:</span>
                                        <span className="ml-1 truncate">{line.startStation?.name || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <MapPin className="h-4 w-4 mr-2 text-red-500" />
                                        <span className="font-medium">End:</span>
                                        <span className="ml-1 truncate">{line.endStation?.name || 'N/A'}</span>
                                    </div>

                                    <div className="pt-4">
                                        <Link href={`/lines/${line.id}`} className="w-full">
                                            <Button variant="outline" className="w-full group">
                                                View Route Details
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </Link>
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
