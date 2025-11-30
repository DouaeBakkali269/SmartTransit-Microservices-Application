'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, Clock, Eye, Bus, Map } from 'lucide-react';

// Mock types
type Incident = {
    id: string;
    tripId: string;
    driverName: string;
    type: string;
    description: string;
    date: string;
    status: 'open' | 'investigating' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    line: string; // Added line
    bus: string;  // Added bus
};

export default function ManageIncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        // Mock fetch incidents
        const mockIncidents: Incident[] = [
            {
                id: "I1",
                tripId: "T2",
                driverName: "Jane Driver",
                type: "Mechanical Issue",
                description: "Engine overheating warning light came on during uphill climb. Vehicle needs inspection.",
                date: "2023-10-27T10:15:00",
                status: "open",
                priority: "high",
                line: "Line 102",
                bus: "BUS-101"
            },
            {
                id: "I2",
                tripId: "T5",
                driverName: "Mike Smith",
                type: "Traffic Delay",
                description: "Heavy congestion due to road works on Main St. 15 min delay expected.",
                date: "2023-10-20T08:30:00",
                status: "resolved",
                priority: "low",
                line: "Line 5",
                bus: "BUS-204"
            },
            {
                id: "I3",
                tripId: "T8",
                driverName: "John Doe",
                type: "Passenger Incident",
                description: "Dispute between passengers regarding seating.",
                date: "2023-10-26T16:45:00",
                status: "investigating",
                priority: "medium",
                line: "Line 12",
                bus: "BUS-305"
            }
        ];

        setTimeout(() => {
            setIncidents(mockIncidents);
            setLoading(false);
        }, 500);
    }, []);

    const handleStatusChange = (status: string) => {
        if (selectedIncident) {
            setIncidents(incidents.map(i => i.id === selectedIncident.id ? { ...i, status: status as any } : i));
            setIsDialogOpen(false);
        }
    };

    const openDetails = (incident: Incident) => {
        setSelectedIncident(incident);
        setIsDialogOpen(true);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-700';
            case 'medium': return 'bg-orange-100 text-orange-700';
            case 'low': return 'bg-blue-100 text-blue-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-red-500';
            case 'investigating': return 'bg-orange-500';
            case 'resolved': return 'bg-green-500';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-8">Incident Management</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Incidents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Loading incidents...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Priority</TableHead>
                                        <TableHead>Line / Bus</TableHead>
                                        <TableHead>Reported By</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {incidents.map((incident) => (
                                        <TableRow key={incident.id}>
                                            <TableCell className="font-mono text-xs">{incident.id}</TableCell>
                                            <TableCell className="font-medium">{incident.type}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getPriorityColor(incident.priority)}>
                                                    {incident.priority}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-xs">
                                                    <span className="font-medium">{incident.line}</span>
                                                    <span className="text-slate-500">{incident.bus}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{incident.driverName}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-slate-500 text-xs">
                                                    {new Date(incident.date).toLocaleDateString()}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(incident.status)}`}></div>
                                                    <span className="capitalize text-sm">{incident.status}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => openDetails(incident)}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Incident Details #{selectedIncident?.id}</DialogTitle>
                            <DialogDescription>
                                Review incident report and update status.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedIncident && (
                            <div className="grid gap-4 py-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className={getPriorityColor(selectedIncident.priority)}>
                                        {selectedIncident.priority.toUpperCase()} PRIORITY
                                    </Badge>
                                    <span className="text-sm text-slate-500">
                                        {new Date(selectedIncident.date).toLocaleString()}
                                    </span>
                                </div>

                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <h4 className="font-semibold text-sm mb-1">{selectedIncident.type}</h4>
                                    <p className="text-sm text-slate-700">{selectedIncident.description}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Driver</span>
                                            <span className="font-medium flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs">D</div>
                                                {selectedIncident.driverName}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Vehicle</span>
                                            <span className="font-medium flex items-center gap-2">
                                                <Bus className="w-4 h-4 text-slate-400" />
                                                {selectedIncident.bus}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Line</span>
                                            <span className="font-medium flex items-center gap-2">
                                                <Map className="w-4 h-4 text-slate-400" />
                                                {selectedIncident.line}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block text-xs uppercase tracking-wider mb-1">Trip ID</span>
                                            <span className="font-medium font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">
                                                {selectedIncident.tripId}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                    <label className="text-sm font-medium">Update Status</label>
                                    <Select onValueChange={handleStatusChange} defaultValue={selectedIncident.status}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="investigating">Investigating</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
