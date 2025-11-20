'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Clock, Search, Navigation2, Map as MapIcon, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getCurrentLocation, DEFAULT_LOCATION, type Location } from '@/lib/geolocation';

// Dynamically import the Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/map'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-slate-400">Loading Map...</div>
});

// Recent searches data with Moroccan locations
const RECENT_SEARCHES = [
    {
        id: '1',
        from: 'ENSIAS',
        to: 'Hassan Tower',
        date: 'Yesterday'
    },
    {
        id: '2',
        from: 'Agdal',
        to: 'Rabat Ville Train Station',
        date: '2 days ago'
    },
    {
        id: '3',
        from: 'Hay Riad',
        to: 'Medina of Rabat',
        date: '3 days ago'
    }
];

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isExchangeMode = searchParams.get('exchange') === 'true';

    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [fromLocation, setFromLocation] = useState<Location | null>(null);
    const [toLocation, setToLocation] = useState<Location | null>(null);
    const [departureDate, setDepartureDate] = useState<Date>(new Date());
    const [timeOption, setTimeOption] = useState<'now' | 'depart' | 'arrive'>('now');
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [mapClickMode, setMapClickMode] = useState<'from' | 'to' | null>(null);
    const [exchangingTicket, setExchangingTicket] = useState<any>(null);

    // Set ENSIAS as default location on mount or load exchange ticket
    useEffect(() => {
        if (isExchangeMode) {
            const storedTicket = localStorage.getItem('exchangingTicket');
            if (storedTicket) {
                const ticket = JSON.parse(storedTicket);
                setExchangingTicket(ticket);
                setFrom(ticket.departureStation);
                setTo(ticket.arrivalStation);
                // We don't set location objects here as we might not have full coords, 
                // but the text inputs are enough for the search
            }
        } else {
            // Use ENSIAS as default
            setFrom(DEFAULT_LOCATION.name);
            setFromLocation({
                id: 'default',
                name: DEFAULT_LOCATION.name,
                type: 'university',
                coordinates: [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng],
                address: DEFAULT_LOCATION.address
            });
        }
    }, [isExchangeMode]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (!from || !to) {
            alert('Please select both departure and destination locations');
            return;
        }

        // In a real app, we would pass these params to the results page
        const params = new URLSearchParams({
            from,
            to,
            date: departureDate.toISOString(),
            timeOption
        });

        // Add coordinates if available
        if (fromLocation) {
            params.append('fromLat', fromLocation.coordinates[0].toString());
            params.append('fromLng', fromLocation.coordinates[1].toString());
        }

        if (toLocation) {
            params.append('toLat', toLocation.coordinates[0].toString());
            params.append('toLng', toLocation.coordinates[1].toString());
        }

        if (isExchangeMode) {
            params.append('exchange', 'true');
        }

        router.push(`/results?${params.toString()}`);
    };

    const handleCurrentLocationClick = async () => {
        setIsLoadingLocation(true);
        const result = await getCurrentLocation();

        if (result.success && result.location) {
            setFrom(result.location.name);
            setFromLocation({
                id: 'current',
                name: result.location.name,
                type: 'current',
                coordinates: [result.location.lat, result.location.lng],
                address: result.location.address
            });
        }
        setIsLoadingLocation(false);
    };

    const handleMapLocationSelect = (lat: number, lng: number, name: string, address: string) => {
        const location: Location = {
            id: 'map-selected',
            name,
            type: 'selected',
            coordinates: [lat, lng],
            address
        };

        if (mapClickMode === 'from') {
            setFrom(name);
            setFromLocation(location);
        } else if (mapClickMode === 'to') {
            setTo(name);
            setToLocation(location);
        }

        setMapClickMode(null);
    };

    const handleRecentSearchClick = (search: typeof RECENT_SEARCHES[0]) => {
        setFrom(search.from);
        setTo(search.to);
        // In a real app, we would also set the location objects
    };

    const handleSwapLocations = () => {
        const tempFrom = from;
        const tempFromLocation = fromLocation;

        setFrom(to);
        setFromLocation(toLocation);

        setTo(tempFrom);
        setToLocation(tempFromLocation);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="relative h-[calc(100vh-64px)] flex flex-col md:flex-row">
                {/* Search Panel */}
                <div className="w-full md:w-[420px] bg-white shadow-xl z-10 p-6 flex flex-col h-full overflow-y-auto">

                    {isExchangeMode && exchangingTicket && (
                        <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <RefreshCw className="h-6 w-6 text-orange-600" />
                                <div>
                                    <h3 className="font-bold text-orange-900">Exchanging Ticket</h3>
                                    <p className="text-sm text-orange-700">
                                        You are exchanging your ticket. The route is fixed, but you can choose a new date and time.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <h1 className="text-2xl font-bold text-slate-900 mb-6">{isExchangeMode ? 'Select New Time' : 'Find your trip'}</h1>

                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="space-y-4">
                            {/* From Location */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="from">From</Label>
                                    {!isExchangeMode && isLoadingLocation && (
                                        <span className="text-xs text-blue-600 flex items-center gap-1">
                                            <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            Detecting location...
                                        </span>
                                    )}
                                </div>
                                <LocationAutocomplete
                                    id="from"
                                    placeholder="Current Location"
                                    value={from}
                                    onChange={(value, location) => {
                                        setFrom(value);
                                        if (location) setFromLocation(location);
                                    }}
                                    onLocationSelect={setFromLocation}
                                    showCurrentLocationButton={!isExchangeMode}
                                    onCurrentLocationClick={handleCurrentLocationClick}
                                    disabled={isExchangeMode}
                                />
                                {!isExchangeMode && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setMapClickMode(mapClickMode === 'from' ? null : 'from')}
                                        className={`w-full mt-2 ${mapClickMode === 'from' ? 'bg-blue-50 border-blue-600 text-blue-700' : ''}`}
                                    >
                                        <MapIcon className="h-4 w-4 mr-2" />
                                        {mapClickMode === 'from' ? 'Click on map to select' : 'Pick from map'}
                                    </Button>
                                )}
                            </div>

                            {/* Swap Button */}
                            <div className="relative flex justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative bg-white px-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 rounded-full border border-slate-200 p-0 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:border-slate-200"
                                        onClick={handleSwapLocations}
                                        disabled={isExchangeMode}
                                    >
                                        <span className="sr-only">Swap locations</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="m21 16-4 4-4-4" />
                                            <path d="M17 20V4" />
                                            <path d="m3 8 4-4 4 4" />
                                            <path d="M7 4v16" />
                                        </svg>
                                    </Button>
                                </div>
                            </div>

                            {/* To Location */}
                            <div className="space-y-2">
                                <Label htmlFor="to">To</Label>
                                <LocationAutocomplete
                                    id="to"
                                    placeholder="Destination"
                                    value={to}
                                    onChange={(value, location) => {
                                        setTo(value);
                                        if (location) setToLocation(location);
                                    }}
                                    onLocationSelect={setToLocation}
                                    disabled={isExchangeMode}
                                />
                                {!isExchangeMode && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setMapClickMode(mapClickMode === 'to' ? null : 'to')}
                                        className={`w-full mt-2 ${mapClickMode === 'to' ? 'bg-blue-50 border-blue-600 text-blue-700' : ''}`}
                                    >
                                        <MapIcon className="h-4 w-4 mr-2" />
                                        {mapClickMode === 'to' ? 'Click on map to select' : 'Pick from map'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <DateTimePicker
                                    value={departureDate}
                                    onChange={setDepartureDate}
                                    minDate={new Date()}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Select value={timeOption} onValueChange={(value: 'now' | 'depart' | 'arrive') => setTimeOption(value)}>
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

                        <Button type="submit" className={`w-full h-12 text-lg ${isExchangeMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            <Search className="mr-2 h-5 w-5" />
                            {isExchangeMode ? 'Find Exchange Trip' : 'Search Routes'}
                        </Button>
                    </form>

                    {/* Recent Searches - Hide in exchange mode */}
                    {!isExchangeMode && (
                        <div className="mt-8">
                            <h3 className="font-semibold text-slate-900 mb-4">Recent Searches</h3>
                            <div className="space-y-3">
                                {RECENT_SEARCHES.map((search) => (
                                    <button
                                        key={search.id}
                                        type="button"
                                        onClick={() => handleRecentSearchClick(search)}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            <Clock className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-900">{search.from} → {search.to}</div>
                                            <div className="text-xs text-slate-500">{search.date}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Map Instructions */}
                    {mapClickMode && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Navigation2 className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div>
                                    <div className="font-medium text-blue-900 text-sm">
                                        Click on the map to select {mapClickMode === 'from' ? 'departure' : 'destination'} location
                                    </div>
                                    <div className="text-xs text-blue-700 mt-1">
                                        The location will be automatically detected and filled in the field above
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Map Area */}
                <div className="flex-1 bg-slate-200 relative">
                    <Map
                        selectedLocation={mapClickMode === 'from' ? fromLocation : mapClickMode === 'to' ? toLocation : fromLocation}
                        onLocationSelect={handleMapLocationSelect}
                        clickable={mapClickMode !== null}
                        markers={[
                            ...(fromLocation && mapClickMode !== 'from' ? [{
                                position: fromLocation.coordinates as [number, number],
                                name: fromLocation.name,
                                address: fromLocation.address
                            }] : []),
                            ...(toLocation && mapClickMode !== 'to' ? [{
                                position: toLocation.coordinates as [number, number],
                                name: toLocation.name,
                                address: toLocation.address
                            }] : [])
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
