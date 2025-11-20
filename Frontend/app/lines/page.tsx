'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

// Mock types
type Line = {
    id: string;
    number: string;
    name: string;
    stations: string[];
    schedule: string;
};

export default function LinesPage() {
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch lines
        const mockLines = [
            {
                id: "L1",
                number: "101",
                name: "Downtown - Airport",
                stations: ["Central Station", "Market Square", "City Park", "Airport Terminal 1"],
                schedule: "Every 15 mins"
            },
            {
                id: "L2",
                number: "102",
                name: "University - Mall",
                stations: ["University Main Gate", "Library", "Tech Park", "Grand Mall"],
                schedule: "Every 20 mins"
            }
        ];

        setTimeout(() => {
            setLines(mockLines);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Bus Lines</h1>
                <p className="text-slate-500 mb-8">View all available bus routes and schedules.</p>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full text-center py-12 text-slate-500">Loading lines...</div>
                    ) : lines.map((line) => (
                        <Card key={line.id} className="hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-blue-600 text-lg px-3 py-1">
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
                                        <span className="ml-1 truncate">{line.stations[0]}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600">
                                        <MapPin className="h-4 w-4 mr-2 text-red-500" />
                                        <span className="font-medium">End:</span>
                                        <span className="ml-1 truncate">{line.stations[line.stations.length - 1]}</span>
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
