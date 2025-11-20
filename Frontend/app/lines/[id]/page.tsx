'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import locationsData from '@/data/rabat-locations.json';

// Dynamically import LineMap to avoid SSR issues
const LineMap = dynamic(() => import('@/components/line-map').then(mod => ({ default: mod.LineMap })), { ssr: false });

// Types
type Station = {
    name: string;
    coordinates: [number, number];
};

type Line = {
    id: string;
    number: string;
    name: string;
    stations: Station[];
    schedule: string;
};

export default function LineDetailPage() {
    const params = useParams();
    const [line, setLine] = useState<Line | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Helper to find coordinates by name
        const getCoords = (name: string): [number, number] => {
            const loc = locationsData.locations.find(l => l.name === name);
            return loc ? [loc.coordinates[0], loc.coordinates[1]] as [number, number] : [34.020882, -6.841650]; // Default to Rabat center
        };

        // Mock fetch line details with real Rabat data
        const fetchLine = () => {
            const lineId = params.id as string;
            let mockLine: Line | null = null;

            if (lineId === 'L1') {
                mockLine = {
                    id: 'L1',
                    number: '101',
                    name: 'ENSIAS - Hassan Tower',
                    stations: [
                        { name: 'ENSIAS', coordinates: getCoords('ENSIAS') },
                        { name: 'Mohammed V University', coordinates: getCoords('Mohammed V University') },
                        { name: 'Agdal', coordinates: getCoords('Agdal') },
                        { name: 'Jardin d\'Essais Botaniques', coordinates: getCoords('Jardin d\'Essais Botaniques') },
                        { name: 'Place Pietri', coordinates: getCoords('Place Pietri') },
                        { name: 'Rabat Ville Train Station', coordinates: getCoords('Rabat Ville Train Station') },
                        { name: 'Hassan Tower', coordinates: getCoords('Hassan Tower') }
                    ],
                    schedule: 'Every 15 mins'
                };
            } else if (lineId === 'L2') {
                mockLine = {
                    id: 'L2',
                    number: '102',
                    name: 'Yacoub El Mansour - Marina',
                    stations: [
                        { name: 'Yacoub El Mansour', coordinates: getCoords('Yacoub El Mansour') },
                        { name: 'Stade Moulay Abdallah', coordinates: getCoords('Stade Moulay Abdallah') },
                        { name: 'Ocean', coordinates: getCoords('Ocean') },
                        { name: 'Medina of Rabat', coordinates: getCoords('Medina of Rabat') },
                        { name: 'Kasbah of the Udayas', coordinates: getCoords('Kasbah of the Udayas') },
                        { name: 'Bouregreg Marina', coordinates: getCoords('Bouregreg Marina') }
                    ],
                    schedule: 'Every 20 mins'
                };
            } else if (lineId === 'L3') {
                mockLine = {
                    id: 'L3',
                    number: '104',
                    name: 'Hay Riad - Salé',
                    stations: [
                        { name: 'Hay Riad', coordinates: getCoords('Hay Riad') },
                        { name: 'Mega Mall', coordinates: getCoords('Mega Mall') },
                        { name: 'Souissi', coordinates: getCoords('Souissi') },
                        { name: 'Hay Nahda', coordinates: getCoords('Hay Nahda') },
                        { name: 'Rabat-Salé Airport', coordinates: getCoords('Rabat-Salé Airport') },
                        { name: 'Salé', coordinates: getCoords('Salé') }
                    ],
                    schedule: 'Every 30 mins'
                };
            }

            setLine(mockLine);
            setLoading(false);
        };

        setTimeout(fetchLine, 500);
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

    if (!line) return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-slate-900">Line not found</h2>
                    <Link href="/lines">
                        <Button className="mt-4">Back to Lines</Button>
                    </Link>
                </div>
            </div>
        </div>
    );

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
                                            <div key={station.name} className="relative">
                                                <div className={`absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white ${isStart ? 'bg-blue-500' : isEnd ? 'bg-red-500' : 'bg-slate-300'} shadow-sm`}></div>
                                                <div className="flex justify-between items-center">
                                                    <span className={`font-medium ${isStart || isEnd ? 'text-slate-900' : 'text-slate-500'}`}>
                                                        {station.name}
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
                        <Card className="h-[600px] overflow-hidden relative bg-slate-100 border-0 shadow-md">
                            <LineMap
                                stations={line.stations}
                                lineColor={line.id === 'L1' ? '#2563eb' : '#0891b2'}
                            />

                            <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md z-[400]">
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
