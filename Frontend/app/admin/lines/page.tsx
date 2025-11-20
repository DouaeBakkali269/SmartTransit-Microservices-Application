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
import { Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react';

// Mock types
type Line = {
    id: string;
    number: string;
    name: string;
    stations: string[];
    schedule: string;
};

export default function ManageLinesPage() {
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLine, setEditingLine] = useState<Line | null>(null);

    useEffect(() => {
        // Mock fetch lines
        const mockLines = [
            {
                id: "L1",
                number: "101",
                name: "Downtown - Airport",
                stations: ["Central Station", "Market Square", "City Park", "Airport Terminal 1"],
                schedule: "Every 15 mins"
            },
            {
                id: "L2",
                number: "102",
                name: "University - Mall",
                stations: ["University Main Gate", "Library", "Tech Park", "Grand Mall"],
                schedule: "Every 20 mins"
            }
        ];

        setTimeout(() => {
            setLines(mockLines);
            setLoading(false);
        }, 500);
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsDialogOpen(false);
        alert(editingLine ? "Line updated successfully" : "Line created successfully");
        setEditingLine(null);
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this line?")) {
            setLines(lines.filter(l => l.id !== id));
        }
    };

    const openEdit = (line: Line) => {
        setEditingLine(line);
        setIsDialogOpen(true);
    };

    const openCreate = () => {
        setEditingLine(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Manage Lines</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Line
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingLine ? 'Edit Line' : 'Create New Line'}</DialogTitle>
                                <DialogDescription>
                                    Configure the bus line details, stations, and schedule.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSave}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="number" className="text-right">Number</Label>
                                        <Input id="number" defaultValue={editingLine?.number} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input id="name" defaultValue={editingLine?.name} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="schedule" className="text-right">Schedule</Label>
                                        <Input id="schedule" defaultValue={editingLine?.schedule} className="col-span-3" required />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">{editingLine ? 'Save Changes' : 'Create Line'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Lines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Loading lines...</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Number</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Schedule</TableHead>
                                        <TableHead>Stations</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lines.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell>
                                                <Badge className="bg-blue-600">{line.number}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">{line.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-slate-500">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {line.schedule}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-slate-500">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {line.stations.length} Stops
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => openEdit(line)}>
                                                        <Edit className="h-4 w-4 text-slate-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(line.id)}>
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
