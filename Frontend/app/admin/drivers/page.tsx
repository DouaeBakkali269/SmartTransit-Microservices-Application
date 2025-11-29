'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, User, Mail, Phone, Lock, Bus } from 'lucide-react';

// Mock types
type Driver = {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    vehicleId?: string;
    lineId?: string; // Added lineId
};

// Mock Lines
const LINES = [
    { id: 'L1', name: 'Line 1: Downtown Loop' },
    { id: 'L2', name: 'Line 2: University Express' },
    { id: 'L3', name: 'Line 3: Airport Shuttle' },
];

export default function ManageDriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

    useEffect(() => {
        // Mock fetch drivers
        const mockDrivers: Driver[] = [
            {
                id: "2",
                name: "Jane Driver",
                email: "driver@gmail.com",
                phone: "+1 (555) 123-4567",
                status: "active",
                vehicleId: "bus-101",
                lineId: "L1"
            },
            {
                id: "4",
                name: "Mike Smith",
                email: "mike@transitma.com",
                phone: "+1 (555) 987-6543",
                status: "inactive"
            }
        ];

        setTimeout(() => {
            setDrivers(mockDrivers);
            setLoading(false);
        }, 500);
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDialogOpen(false);
        alert(editingDriver ? "Driver updated successfully (including password if changed)" : "Driver created successfully");
        setEditingDriver(null);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to remove this driver?")) {
            setDrivers(drivers.filter(d => d.id !== id));
        }
    };

    const openEdit = (driver: Driver) => {
        setEditingDriver(driver);
        setIsDialogOpen(true);
    };

    const openCreate = () => {
        setEditingDriver(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Manage Drivers</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Driver
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingDriver ? 'Edit Driver' : 'Register New Driver'}</DialogTitle>
                                <DialogDescription>
                                    Manage driver details, line assignment, and credentials.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSave}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input id="name" defaultValue={editingDriver?.name} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">Email</Label>
                                        <Input id="email" type="email" defaultValue={editingDriver?.email} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="phone" className="text-right">Phone</Label>
                                        <Input id="phone" defaultValue={editingDriver?.phone} className="col-span-3" />
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="line" className="text-right">Assigned Line</Label>
                                        <div className="col-span-3">
                                            <Select defaultValue={editingDriver?.lineId || "unassigned"}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a line" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {LINES.map(line => (
                                                        <SelectItem key={line.id} value={line.id}>{line.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 my-2"></div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="password" className="text-right">Password</Label>
                                        <div className="col-span-3 relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder={editingDriver ? "Leave blank to keep current" : "Set password"}
                                                className="pl-9"
                                                required={!editingDriver}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">{editingDriver ? 'Save Changes' : 'Register Driver'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Driver Roster</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Loading drivers...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Assigned Line</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drivers.map((driver) => (
                                        <TableRow key={driver.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-slate-500" />
                                                    </div>
                                                    <span className="font-medium">{driver.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm text-slate-500">
                                                    <span className="flex items-center"><Mail className="h-3 w-3 mr-1" /> {driver.email}</span>
                                                    <span className="flex items-center"><Phone className="h-3 w-3 mr-1" /> {driver.phone}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={driver.status === 'active' ? 'default' : 'secondary'} className={driver.status === 'active' ? 'bg-green-600' : ''}>
                                                    {driver.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {driver.lineId ? (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {LINES.find(l => l.id === driver.lineId)?.name.split(':')[0] || driver.lineId}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-slate-400 text-xs italic">No Line</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {driver.vehicleId ? (
                                                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded flex items-center w-fit">
                                                        <Bus className="h-3 w-3 mr-1 text-slate-500" />
                                                        {driver.vehicleId}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(driver)}>
                                                        <Edit className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(driver.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
