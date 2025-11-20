'use client';

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, Clock, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function SearchPage() {
    const router = useRouter();
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, we would pass these params to the results page
        router.push(`/results?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="relative h-[calc(100vh-64px)] flex flex-col md:flex-row">
                {/* Search Panel */}
                <div className="w-full md:w-[400px] bg-white shadow-xl z-10 p-6 flex flex-col h-full overflow-y-auto">
                    <h1 className="text-2xl font-bold text-slate-900 mb-6">Find your trip</h1>

                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="from">From</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="from"
                                        placeholder="Current Location"
                                        className="pl-9"
                                        value={from}
                                        onChange={(e) => setFrom(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="relative flex justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative bg-white px-2">
                                    <Button type="button" variant="ghost" size="sm" className="h-8 w-8 rounded-full border border-slate-200 p-0" onClick={() => {
                                        const temp = from;
                                        setFrom(to);
                                        setTo(temp);
                                    }}>
                                        <span className="sr-only">Swap locations</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-down"><path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" /></svg>
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="to">To</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="to"
                                        placeholder="Destination"
                                        className="pl-9"
                                        value={to}
                                        onChange={(e) => setTo(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Button variant="outline" className="w-full justify-start text-left font-normal" type="button">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Today</span>
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Select defaultValue="now">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="now">Now</SelectItem>
                                        <SelectItem value="depart">Depart at...</SelectItem>
                                        <SelectItem value="arrive">Arrive by...</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                            <Search className="mr-2 h-5 w-5" />
                            Search Routes
                        </Button>
                    </form>

                    <div className="mt-8">
                        <h3 className="font-semibold text-slate-900 mb-4">Recent Searches</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                    <Clock className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900">Central Station → Airport</div>
                                    <div className="text-xs text-slate-500">Yesterday</div>
                                </div>
                            </button>
                            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group">
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                    <Clock className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-slate-900">Home → University</div>
                                    <div className="text-xs text-slate-500">2 days ago</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Map Area */}
                <div className="flex-1 bg-slate-200 relative">
                    <Map />
                </div>
            </div>
        </div>
    );
}
