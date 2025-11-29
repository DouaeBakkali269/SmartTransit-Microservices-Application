'use client';

import { Button } from '@/components/ui/button';
import { Bus, Footprints } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type Trip = {
    id: string;
    lineNumber: string;
    operator: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    type: 'Direct' | 'With transfer';
    price: number;
    services: string[];
    isImmediate?: boolean;
    distance?: number;
    walkingDeparture?: {
        duration: number; // minutes
        distance: number; // km
        toStation: string;
    };
    walkingArrival?: {
        duration: number; // minutes
        distance: number; // km
        fromStation: string;
    };
    departureCoords?: [number, number];
    arrivalCoords?: [number, number];
};

interface TripResultCardProps {
    trip: Trip;
    isInCart: boolean;
    isExchangeMode: boolean;
    onAddToCart: (trip: Trip) => void;
    userLocation: [number, number];
}

export function TripResultCard({
    trip,
    isInCart,
    isExchangeMode,
    onAddToCart,
    userLocation
}: TripResultCardProps) {
    const router = useRouter();

    const handleViewDetails = () => {
        const params = new URLSearchParams({
            line: trip.lineNumber,
            operator: trip.operator,
            from: trip.departureStation,
            to: trip.arrivalStation,
            depTime: trip.departureTime,
            arrTime: trip.arrivalTime,
            duration: trip.duration,
            price: trip.price.toString(),
            services: trip.services.join(','),
        });

        if (trip.walkingDeparture) {
            params.append('walkDepDist', trip.walkingDeparture.distance.toString());
            params.append('walkDepDur', trip.walkingDeparture.duration.toString());
        }
        if (trip.walkingArrival) {
            params.append('walkArrDist', trip.walkingArrival.distance.toString());
            params.append('walkArrDur', trip.walkingArrival.duration.toString());
        }

        router.push(`/trips/${trip.id}?${params.toString()}`);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mb-4 border border-slate-200 overflow-hidden">
            <div className="flex flex-col lg:flex-row min-h-[160px]">
                {/* Left Section: Schedule & Info */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                    {/* Top Row: Schedule */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        {/* Departure */}
                        <div className="text-center min-w-[100px]">
                            <div className="text-3xl font-bold text-slate-900">{trip.departureTime}</div>
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">{trip.departureStation}</div>
                            {trip.walkingDeparture && (
                                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-blue-500">
                                    <Footprints className="h-3 w-3" />
                                    <span>+{trip.walkingDeparture.duration}min</span>
                                </div>
                            )}
                        </div>

                        {/* Middle: Duration & Line */}
                        <div className="flex-1 flex flex-col items-center px-4 mt-2">
                            <div className="text-sm text-slate-500 font-medium mb-1">{trip.duration}</div>
                            <div className="w-full flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                                <div className="h-[2px] flex-1 bg-slate-100 relative">
                                    <div className="absolute inset-0 bg-blue-500/20 w-full"></div>
                                </div>
                                <div className="h-2 w-2 rounded-full bg-blue-100 border-2 border-blue-500"></div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                    Line {trip.lineNumber}
                                </span>
                                <span className="text-xs text-slate-400">Direct</span>
                            </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center min-w-[100px]">
                            <div className="text-3xl font-bold text-slate-900">{trip.arrivalTime}</div>
                            <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">{trip.arrivalStation}</div>
                            {trip.walkingArrival && (
                                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-blue-500">
                                    <Footprints className="h-3 w-3" />
                                    <span>+{trip.walkingArrival.duration}min</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row: Operator & Services */}
                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg">
                                <Bus className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-medium uppercase">Operator</span>
                                <span className="text-sm font-semibold text-slate-700">{trip.operator}</span>
                            </div>

                            {trip.services.length > 0 && (
                                <div className="flex gap-1 ml-4 border-l border-slate-100 pl-4">
                                    {trip.services.map((service, idx) => (
                                        <span key={idx} className="p-1.5 bg-slate-50 rounded text-slate-400" title={service}>
                                            {service === 'WiFi' && (
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                                </svg>
                                            )}
                                            {service === 'Air Conditioning' && (
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                            {!['WiFi', 'Air Conditioning'].includes(service) && (
                                                <span className="text-[10px]">{service.substring(0, 2)}</span>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            variant="ghost"
                            onClick={handleViewDetails}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Details
                        </Button>
                    </div>
                </div>

                {/* Right Section: Price & Book */}
                <div className="w-full lg:w-48 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 flex flex-col justify-center items-center">
                    <div className="text-3xl font-bold text-slate-900 mb-4">{trip.price} <span className="text-sm font-normal text-slate-500">DH</span></div>

                    <Button
                        onClick={() => onAddToCart(trip)}
                        disabled={!isExchangeMode && !!isInCart}
                        className={`w-full rounded-lg font-semibold shadow-sm transition-all ${isExchangeMode
                            ? 'bg-orange-600 hover:bg-orange-700 text-white'
                            : isInCart
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {isExchangeMode ? 'Exchange' : isInCart ? 'Added' : 'Select'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
