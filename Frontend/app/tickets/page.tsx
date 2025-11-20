'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QrCode, Calendar, Clock, MapPin, RefreshCw, XCircle, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

// Mock types
type Ticket = {
    id: string;
    tripId: string;
    purchaseDate: string;
    status: 'active' | 'used' | 'cancelled';
    price: number;
    trip: {
        line: { number: string; name: string };
        startTime: string;
        endTime: string;
        startStation: string;
        endStation: string;
    };
};

export default function TicketsPage() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch tickets
        const mockTickets: Ticket[] = [
            {
                id: "TK1",
                tripId: "T1",
                purchaseDate: "2023-10-26T15:30:00",
                status: "active",
                price: 2.50,
                trip: {
                    line: { number: "101", name: "Downtown - Airport" },
                    startTime: "2023-10-27T08:00:00",
                    endTime: "2023-10-27T09:00:00",
                    startStation: "Central Station",
                    endStation: "Airport Terminal 1"
                }
            },
            {
                id: "TK2",
                tripId: "T3",
                purchaseDate: "2023-10-20T10:00:00",
                status: "used",
                price: 2.50,
                trip: {
                    line: { number: "102", name: "University - Mall" },
                    startTime: "2023-10-21T14:00:00",
                    endTime: "2023-10-21T15:00:00",
                    startStation: "University Main Gate",
                    endStation: "Grand Mall"
                }
            }
        ];

        setTimeout(() => {
            setTickets(mockTickets);
            setLoading(false);
        }, 500);
    }, []);

    const handleExchange = (id: string) => {
        alert("Exchange functionality would open here");
    };

    const handleCancel = (id: string) => {
        if (confirm("Are you sure you want to cancel this ticket?")) {
            setTickets(tickets.map(t => t.id === id ? { ...t, status: 'cancelled' } : t));
        }
    };

    const TicketCard = ({ ticket }: { ticket: Ticket }) => (
        <Card className={`overflow-hidden border-l-4 ${ticket.status === 'active' ? 'border-l-green-500' : ticket.status === 'cancelled' ? 'border-l-red-500' : 'border-l-slate-400'}`}>
            <CardHeader className="pb-2 bg-slate-50/50">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-white">
                                Ticket #{ticket.id}
                            </Badge>
                            {ticket.status === 'active' && <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge>}
                            {ticket.status === 'used' && <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">Used</Badge>}
                            {ticket.status === 'cancelled' && <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelled</Badge>}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">Line {ticket.trip.line.number}</h3>
                        <p className="text-sm text-slate-500">{ticket.trip.line.name}</p>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-lg">${ticket.price.toFixed(2)}</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-slate-900">
                                    {new Date(ticket.trip.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                </div>
                                <div className="text-xs text-slate-500">Date</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="h-4 w-4 text-slate-400 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-slate-900">
                                    {new Date(ticket.trip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ticket.trip.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-xs text-slate-500">Time</div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-blue-500 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-slate-900">{ticket.trip.startStation}</div>
                                <div className="text-xs text-slate-500">From</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                            <div>
                                <div className="text-sm font-medium text-slate-900">{ticket.trip.endStation}</div>
                                <div className="text-xs text-slate-500">To</div>
                            </div>
                        </div>
                    </div>
                </div>

                {ticket.status === 'active' && (
                    <div className="mt-6 flex justify-center">
                        <div className="bg-white p-2 border border-slate-200 rounded-lg">
                            <QrCode className="h-32 w-32 text-slate-900" />
                        </div>
                    </div>
                )}
            </CardContent>
            {ticket.status === 'active' && (
                <CardFooter className="bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => handleExchange(ticket.id)} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Exchange
                    </Button>
                    <Button variant="destructive" onClick={() => handleCancel(ticket.id)} className="w-full bg-red-50 text-red-600 hover:bg-red-100 border-red-200 shadow-none">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                </CardFooter>
            )}
        </Card>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">My Tickets</h1>

                <Tabs defaultValue="active" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                        <TabsTrigger value="active">Active Tickets</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12 text-slate-500">Loading tickets...</div>
                        ) : tickets.filter(t => t.status === 'active').length > 0 ? (
                            tickets.filter(t => t.status === 'active').map(ticket => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300">
                                <Ticket className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-lg font-medium text-slate-900">No active tickets</h3>
                                <p className="text-slate-500 mb-4">You don't have any upcoming trips.</p>
                                <Link href="/search">
                                    <Button>Book a Trip</Button>
                                </Link>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        {tickets.filter(t => t.status !== 'active').map(ticket => (
                            <TicketCard key={ticket.id} ticket={ticket} />
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
