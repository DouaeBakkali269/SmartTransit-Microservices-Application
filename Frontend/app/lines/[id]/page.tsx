'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// Mock types
type Line = {
    id: string;
    number: string;
    name: string;
    stations: string[];
    schedule: string;
};

export default function LineDetailPage() {
    const params = useParams();
    const [line, setLine] = useState<Line | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch line details
        const mockLine = {
            id: params.id as string,
            number: params.id === 'L1' ? "101" : "102",
            name: params.id === 'L1' ? "Downtown - Airport" : "University - Mall",
            stations: params.id === 'L1'
                ? ["Central Station", "Market Square", "City Park", "Airport Terminal 1"]
                : ["University Main Gate", "Library", "Tech Park", "Grand Mall"],
            schedule: params.id === 'L1' ? "Every 15 mins" : "Every 20 mins"
        };

        setTimeout(() => {
            setLine(mockLine);
            setLoading(false);
        }, 500);
    }, [params.id]);

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

    if (!line) return <div>Line not found</div>;

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link href="/lines" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to Lines
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-blue-600 text-lg px-3 py-1">
                                        {line.number}
                                    </Badge>
                                    <Badge variant="outline" className="flex items-center gap-1 text-slate-600">
                                        <Clock className="h-3 w-3" />
                                        {line.schedule}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl">{line.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative pl-8 border-l-2 border-slate-200 space-y-8 my-4">
                                    {line.stations.map((station, index) => {
                                        const isStart = index === 0;
                                        const isEnd = index === line.stations.length - 1;

                                        return (
                                            <div key={station} className="relative">
                                                <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white ${isStart ? 'bg-blue-500' : isEnd ? 'bg-red-500' : 'bg-slate-300'} shadow-sm`}></div>
                                                <div className="flex justify-between items-center">
                                                    <span className={`font-medium ${isStart || isEnd ? 'text-slate-900' : 'text-slate-500'}`}>
                                                        {station}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card className="h-[600px] overflow-hidden relative bg-slate-200">
                            {/* Mock Map Background */}
                            <div className="absolute inset-0 bg-[#e5e7eb] opacity-50"
                                style={{
                                    backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                                    backgroundSize: '20px 20px'
                                }}>
                            </div>

                            {/* Decorative Map Elements */}
                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <svg className="w-full h-full" viewBox="0 0 800 600">
                                    {/* Route Line */}
                                    <path d="M100,100 Q400,50 700,500" fill="none" stroke="#2563eb" strokeWidth="6" strokeDasharray="10,5" />

                                    {/* Stations */}
                                    <circle cx="100" cy="100" r="8" fill="#2563eb" stroke="white" strokeWidth="3" />
                                    <text x="100" y="130" textAnchor="middle" className="text-xs font-bold fill-slate-700">Start</text>

                                    <circle cx="700" cy="500" r="8" fill="#ef4444" stroke="white" strokeWidth="3" />
                                    <text x="700" y="530" textAnchor="middle" className="text-xs font-bold fill-slate-700">End</text>
                                </svg>
                            </div>

                            <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
                                <h4 className="font-semibold text-sm text-slate-900">Route Trajectory</h4>
                                <p className="text-xs text-slate-500">Visual representation of the line path</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
