'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bus, Calendar, Download, RefreshCw, QrCode as QrCodeIcon, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';

type Ticket = {
    id: string;
    bookingReference: string;
    operator: string;
    lineNumber: string;
    departureStation: string;
    arrivalStation: string;
    departureTime: string;
    arrivalTime: string;
    date: string;
    price: number;
    passengers: number;
    qrCodeUrl: string;
    exchangesRemaining: number;
    status: 'active' | 'exchanged' | 'used' | 'cancelled';
};

export default function TicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [showExchangeWarning, setShowExchangeWarning] = useState(false);
    const [showCancelWarning, setShowCancelWarning] = useState(false);
    const [exchangeSuccessInfo, setExchangeSuccessInfo] = useState<{ message: string; remaining?: number; newTime?: string } | null>(null);
    const [showExchangeBanner, setShowExchangeBanner] = useState(false);

    useEffect(() => {
        const loadTickets = async () => {
            const storedTickets = localStorage.getItem('userTickets');
            if (storedTickets) {
                const parsedTickets = JSON.parse(storedTickets);
                const ticketsWithQR = await Promise.all(
                    parsedTickets.map(async (ticket: Ticket) => {
                        if (!ticket.qrCodeUrl) {
                            const ticketUrl = `${window.location.origin}/ticket/${ticket.bookingReference}`;
                            const qrCodeUrl = await QRCode.toDataURL(ticketUrl, {
                                width: 300,
                                margin: 2,
                                color: { dark: '#7c3aed', light: '#ffffff' }
                            });
                            return { ...ticket, qrCodeUrl };
                        }
                        return ticket;
                    })
                );
                setTickets([...ticketsWithQR].reverse());
                localStorage.setItem('userTickets', JSON.stringify(ticketsWithQR));
            }
            setLoading(false);
        };
        loadTickets();
        // Check for an exchange success flag set by the results page
        try {
            const success = localStorage.getItem('exchangeSuccess');
            if (success) {
                const info = JSON.parse(success);
                setExchangeSuccessInfo(info);
                setShowExchangeBanner(true);
                // remove the flag so it doesn't show again
                localStorage.removeItem('exchangeSuccess');
                // auto-hide after 4s
                setTimeout(() => setShowExchangeBanner(false), 4000);
            }
        } catch (e) {
            // ignore parse errors
        }
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const isUpcoming = (ticket: Ticket) => {
        const ticketDate = new Date(ticket.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return ticketDate >= today && (ticket.status === 'active' || ticket.status === 'exchanged');
    };

    const upcomingTickets = tickets.filter(isUpcoming);
    const historyTickets = tickets.filter(ticket => !isUpcoming(ticket));

    const handleExchangeTicket = (ticket: Ticket) => {
        if (ticket.exchangesRemaining <= 0) {
            alert('This ticket has no exchanges remaining.');
            return;
        }
        setSelectedTicket(ticket);
        setShowExchangeWarning(true);
    };

    const confirmExchange = () => {
        if (!selectedTicket) return;
        localStorage.setItem('exchangingTicket', JSON.stringify(selectedTicket));
        // Redirect directly to results with the current ticket route/date pre-filled
        const params = new URLSearchParams({
            from: selectedTicket.departureStation,
            to: selectedTicket.arrivalStation,
            date: selectedTicket.date,
            exchange: 'true'
        });
        router.push(`/results?${params.toString()}`);
    };

    const handleCancelTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setShowCancelWarning(true);
    };

    const confirmCancel = () => {
        if (!selectedTicket) return;
        const updatedTickets = tickets.map(t =>
            t.id === selectedTicket.id ? { ...t, status: 'cancelled' as const } : t
        );
        setTickets(updatedTickets);
        localStorage.setItem('userTickets', JSON.stringify(updatedTickets));
        setShowCancelWarning(false);
        setSelectedTicket(null);
    };

    const downloadTicket = (ticket: Ticket) => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Ticket - ${ticket.bookingReference}</title>
                    <style>
                        body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; text-align: center; background-color: #f8fafc; }
                        .ticket-container { background: white; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 32px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                        h1 { color: #4c1d95; margin: 0 0 8px 0; font-size: 24px; }
                        .ref { color: #64748b; font-size: 14px; margin-bottom: 24px; font-family: monospace; }
                        .route { font-size: 20px; font-weight: bold; color: #1e293b; margin-bottom: 8px; }
                        .time { font-size: 16px; color: #334155; margin-bottom: 24px; }
                        img { width: 200px; height: 200px; display: block; margin: 0 auto; }
                        .footer { margin-top: 20px; font-size: 12px; color: #94a3b8; }
                    </style>
                </head>
                <body>
                    <div class="ticket-container">
                        <h1>SmartTransit Ticket</h1>
                        <div class="ref">REF: ${ticket.bookingReference}</div>
                        <div class="route">${ticket.departureStation} → ${ticket.arrivalStation}</div>
                        <div class="time">${new Date(ticket.date).toLocaleDateString()} • ${ticket.departureTime}</div>
                        <img src="${ticket.qrCodeUrl}" onload="setTimeout(function(){ window.print(); window.close(); }, 500);" />
                        <div class="footer">Scan this QR code at the bus entrance</div>
                    </div>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const TicketCard = ({ ticket }: { ticket: Ticket }) => (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                        <Bus className="h-3.5 w-3.5" />
                        <span className="font-semibold text-xs">{ticket.operator} Line {ticket.lineNumber}</span>
                    </div>
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30 text-xs px-2 py-0">
                        {ticket.status === 'active' ? 'Active' :
                            ticket.status === 'exchanged' ? `Exchanged (${3 - ticket.exchangesRemaining}/3)` :
                                ticket.status === 'cancelled' ? 'Cancelled' : 'Used'}
                    </Badge>
                </div>
                <div className="text-center">
                    <div className="text-base font-bold mb-0.5">{ticket.departureStation} → {ticket.arrivalStation}</div>
                    <div className="text-xs opacity-90">Ref: {ticket.bookingReference}</div>
                </div>
            </CardHeader>

            <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                        <div className="text-xs text-slate-500 mb-0.5">Date</div>
                        <div className="font-semibold text-xs text-slate-900 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-purple-600" />
                            <span className="text-xs">{formatDate(ticket.date)}</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 mb-0.5">Departure</div>
                        <div className="font-semibold text-xs text-slate-900">{ticket.departureTime}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 mb-0.5">Arrival</div>
                        <div className="font-semibold text-xs text-slate-900">{ticket.arrivalTime}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 mb-0.5">Price</div>
                        <div className="font-semibold text-xs text-green-600">{ticket.price} DH</div>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-2 mb-2 text-center">
                    <img src={ticket.qrCodeUrl} alt="QR Code" className="w-28 h-28 mx-auto mb-1" />
                    <div className="flex items-center justify-center gap-1 text-xs text-slate-600">
                        <QrCodeIcon className="h-3 w-3" />
                        <span>Scan to verify</span>
                    </div>
                </div>

                {(ticket.status === 'active' || ticket.status === 'exchanged') && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 mb-2">
                        <div className="flex items-center gap-1.5 text-xs text-blue-800">
                            <RefreshCw className="h-3 w-3" />
                            <span>{ticket.exchangesRemaining} exchange{ticket.exchangesRemaining !== 1 ? 's' : ''} remaining</span>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="bg-slate-50 border-t border-slate-200 p-2">
                <div className="flex gap-1.5 w-full">
                    <Button onClick={() => downloadTicket(ticket)} variant="outline" size="sm" className="flex-1 text-xs h-7 px-2">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                    </Button>
                    <Button onClick={() => router.push(`/tickets/${ticket.id}`)} variant="ghost" size="sm" className="flex-1 text-xs h-7 px-2">
                        Details
                    </Button>
                    {(ticket.status === 'active' || ticket.status === 'exchanged') && (
                        <>
                            <Button onClick={() => handleExchangeTicket(ticket)} disabled={ticket.exchangesRemaining <= 0} size="sm" className="flex-1 bg-purple-700 hover:bg-purple-800 text-white text-xs h-7 px-2">
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Exchange
                            </Button>
                            <Button onClick={() => handleCancelTicket(ticket)} variant="outline" size="sm" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs h-7 px-2">
                                <X className="h-3 w-3 mr-1" />
                                Cancel
                            </Button>
                        </>
                    )}
                </div>
            </CardFooter>
        </Card>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <Navbar />
                <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                    <div className="text-center">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
                        <p className="text-slate-500 mt-4">Loading your tickets...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Navbar />
            {/* Exchange success banner */}
            {showExchangeBanner && exchangeSuccessInfo && (
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="bg-green-100 border border-green-200 text-green-800 rounded-lg p-3 flex items-center gap-3">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-green-600 border-r-transparent"></div>
                        <div className="flex-1 text-sm">
                            <div className="font-semibold">{exchangeSuccessInfo.message}</div>
                            {exchangeSuccessInfo.remaining !== undefined && (
                                <div className="text-xs">You have {exchangeSuccessInfo.remaining} exchange{exchangeSuccessInfo.remaining !== 1 ? 's' : ''} remaining.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Tickets</h1>
                    <p className="text-slate-600">View and manage your bus tickets</p>
                </div>

                <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
                        <TabsTrigger value="upcoming">Upcoming ({upcomingTickets.length})</TabsTrigger>
                        <TabsTrigger value="history">History ({historyTickets.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-6">
                        {upcomingTickets.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Bus className="h-12 w-12 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">No upcoming trips</h2>
                                <p className="text-slate-600 mb-6">Book your next bus trip to see your tickets here</p>
                                <Button onClick={() => router.push('/search')} className="bg-purple-700 hover:bg-purple-800 text-white">Book a Trip</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {upcomingTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-6">
                        {historyTickets.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
                                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                                    <Calendar className="h-12 w-12 text-slate-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">No ticket history</h2>
                                <p className="text-slate-600">Your past trips will appear here</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {historyTickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Exchange Warning Modal */}
            {showExchangeWarning && selectedTicket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RefreshCw className="h-8 w-8 text-orange-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Exchange Ticket?</h2>
                            <p className="text-slate-600">You have <strong>{selectedTicket.exchangesRemaining} exchange{selectedTicket.exchangesRemaining !== 1 ? 's' : ''}</strong> remaining for this ticket.</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 mb-6">
                            <div className="text-sm text-slate-600 mb-2">Current Ticket:</div>
                            <div className="font-semibold text-slate-900">{selectedTicket.departureStation} → {selectedTicket.arrivalStation}</div>
                            <div className="text-sm text-slate-600 mt-1">{formatDate(selectedTicket.date)} at {selectedTicket.departureTime}</div>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => { setShowExchangeWarning(false); setSelectedTicket(null); }} variant="outline" className="flex-1">Cancel</Button>
                            <Button onClick={confirmExchange} className="flex-1 bg-purple-700 hover:bg-purple-800 text-white">Choose New Time</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Warning Modal */}
            {showCancelWarning && selectedTicket && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <X className="h-8 w-8 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Cancel Ticket?</h2>
                            <p className="text-slate-600">Are you sure you want to cancel this ticket? This action cannot be undone.</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 mb-6">
                            <div className="text-sm text-slate-600 mb-2">Ticket Details:</div>
                            <div className="font-semibold text-slate-900">{selectedTicket.departureStation} → {selectedTicket.arrivalStation}</div>
                            <div className="text-sm text-slate-600 mt-1">{formatDate(selectedTicket.date)} at {selectedTicket.departureTime}</div>
                            <div className="text-sm font-semibold text-green-600 mt-2">{selectedTicket.price} DH</div>
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={() => { setShowCancelWarning(false); setSelectedTicket(null); }} variant="outline" className="flex-1">Keep Ticket</Button>
                            <Button onClick={confirmCancel} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Cancel Ticket</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
