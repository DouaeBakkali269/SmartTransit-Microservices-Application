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
import api from '@/lib/axios';
import { useAuth } from '@/lib/auth-context';

type Driver = {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
    vehicleId?: string;
    lineId?: string;
    lineName?: string;
};

type Line = {
    id: string;
    number: string;
    name: string;
};

export default function ManageDriversPage() {
    const { user } = useAuth();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        lineId: 'unassigned',
        password: '',
        status: 'active' as 'active' | 'inactive'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [driversRes, linesRes] = await Promise.all([
                    api.get('/admin/drivers'),
                    api.get('/admin/lines')
                ]);
                setDrivers(driversRes.data.drivers || []);
                setLines(linesRes.data.lines || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, lineId: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingDriver) {
                // Update existing driver
                const updateData: any = {
                    name: formData.name,
                    phone: formData.phone,
                    lineId: formData.lineId === 'unassigned' ? null : formData.lineId,
                    status: formData.status
                };

                if (formData.password) {
                    updateData.password = formData.password;
                }

                const response = await api.put(`/admin/drivers/${editingDriver.id}`, updateData);
                setDrivers(drivers.map(d => d.id === editingDriver.id ? { ...d, ...response.data.driver } : d));
                alert("Driver updated successfully");
            } else {
                // Create new driver
                const createData = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                    lineId: formData.lineId === 'unassigned' ? null : formData.lineId
                };

                const response = await api.post('/admin/drivers', createData);
                setDrivers([...drivers, response.data.driver]);
                alert("Driver created successfully");
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            console.error("Error saving driver:", error);
            alert(error.response?.data?.error || "Failed to save driver");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to remove this driver?")) {
            try {
                await api.delete(`/admin/drivers/${id}`);
                setDrivers(drivers.filter(d => d.id !== id));
            } catch (error: any) {
                console.error("Error deleting driver:", error);
                alert(error.response?.data?.error || "Failed to delete driver");
            }
        }
    };

    const openEdit = (driver: Driver) => {
        setEditingDriver(driver);
        setFormData({
            name: driver.name,
            email: driver.email,
            phone: driver.phone,
            lineId: driver.lineId || 'unassigned',
            password: '',
            status: driver.status
        });
        setIsDialogOpen(true);
    };

    const openCreate = () => {
        setEditingDriver(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            lineId: 'unassigned',
            password: '',
            status: 'active'
        });
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
                                        <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">Email</Label>
                                        <Input id="email" type="email" value={formData.email} onChange={handleInputChange} className="col-span-3" required disabled={!!editingDriver} />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="phone" className="text-right">Phone</Label>
                                        <Input id="phone" value={formData.phone} onChange={handleInputChange} className="col-span-3" />
                                    </div>

                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="lineId" className="text-right">Assigned Line</Label>
                                        <div className="col-span-3">
                                            <Select value={formData.lineId} onValueChange={handleSelectChange}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a line" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                                    {lines.map(line => (
                                                        <SelectItem key={line.id} value={line.id}>{line.number} - {line.name}</SelectItem>
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
                                                value={formData.password}
                                                onChange={handleInputChange}
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
                        ) : drivers.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No drivers found.</div>
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
                                                        {lines.find(l => l.id === driver.lineId)?.number || driver.lineName || driver.lineId}
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
