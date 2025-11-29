'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Clock, MapPin, ArrowLeft, Save, Bus, User, ArrowUp, ArrowDown, X } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/lib/auth-context';

// Dynamic import for the map editor
const LineEditorMap = dynamic(() => import('@/components/line-editor-map').then(mod => mod.LineEditorMap), {
    ssr: false,
    loading: () => <div className="w-full h-[500px] bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map Editor...</div>
});

// Types
type Station = {
    id: string;
    name: string;
    coordinates: [number, number];
    order?: number;
};

type Line = {
    id: string;
    number: string;
    name: string;
    stations: Station[];
    schedule: string;
    color: string;
    status?: 'active' | 'inactive';
};

export default function ManageLinesPage() {
    const { user } = useAuth();
    const [lines, setLines] = useState<Line[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [editingLine, setEditingLine] = useState<Line | null>(null);

    useEffect(() => {
        const fetchLines = async () => {
            try {
                const response = await api.get('/admin/lines');
                setLines(response.data.lines || []);
            } catch (error) {
                console.error("Error fetching lines:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchLines();
        }
    }, [user]);

    const handleCreate = () => {
        const newLine: Line = {
            id: '', // Will be assigned by backend
            number: "",
            name: "New Line",
            color: "#3b82f6",
            schedule: "",
            stations: [],
            status: 'active'
        };
        setEditingLine(newLine);
        setView('edit');
    };

    const handleEdit = async (line: Line) => {
        try {
            // Fetch full details including stations if needed, or just use what we have
            // For now, we assume the list endpoint returns enough info, or we could fetch details
            const response = await api.get(`/admin/lines/${line.id}`);
            setEditingLine(response.data.line);
            setView('edit');
        } catch (error) {
            console.error("Error fetching line details:", error);
            // Fallback to using the line object from the list if detail fetch fails
            setEditingLine(JSON.parse(JSON.stringify(line)));
            setView('edit');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this line?")) {
            try {
                await api.delete(`/admin/lines/${id}`);
                setLines(lines.filter(l => l.id !== id));
            } catch (error: any) {
                console.error("Error deleting line:", error);
                alert(error.response?.data?.error || "Failed to delete line");
            }
        }
    };

    const handleSave = async () => {
        if (!editingLine) return;

        try {
            const lineData = {
                number: editingLine.number,
                name: editingLine.name,
                color: editingLine.color,
                schedule: editingLine.schedule,
                stations: editingLine.stations.map((s, index) => ({
                    name: s.name,
                    coordinates: s.coordinates,
                    order: index
                })),
                status: editingLine.status || 'active'
            };

            if (editingLine.id) {
                // Update
                const response = await api.put(`/admin/lines/${editingLine.id}`, lineData);
                setLines(lines.map(l => l.id === editingLine.id ? response.data.line : l));
                alert("Line updated successfully");
            } else {
                // Create
                const response = await api.post('/admin/lines', lineData);
                setLines([...lines, response.data.line]);
                alert("Line created successfully");
            }
            setView('list');
            setEditingLine(null);
        } catch (error: any) {
            console.error("Error saving line:", error);
            alert(error.response?.data?.error || "Failed to save line");
        }
    };

    const updateStationName = (id: string, newName: string) => {
        if (!editingLine) return;
        const updatedStations = editingLine.stations.map(s =>
            s.id === id ? { ...s, name: newName } : s
        );
        setEditingLine({ ...editingLine, stations: updatedStations });
    };

    const moveStation = (index: number, direction: 'up' | 'down') => {
        if (!editingLine) return;
        const stations = [...editingLine.stations];
        if (direction === 'up' && index > 0) {
            [stations[index], stations[index - 1]] = [stations[index - 1], stations[index]];
        } else if (direction === 'down' && index < stations.length - 1) {
            [stations[index], stations[index + 1]] = [stations[index + 1], stations[index]];
        }
        setEditingLine({ ...editingLine, stations });
    };

    const removeStation = (id: string) => {
        if (!editingLine) return;
        setEditingLine({
            ...editingLine,
            stations: editingLine.stations.filter(s => s.id !== id)
        });
    };

    if (view === 'edit' && editingLine) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col">
                <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-50 shadow-sm">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={() => setView('list')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div className="h-6 w-px bg-slate-200"></div>
                            <h1 className="text-xl font-bold text-slate-900">
                                {editingLine.name || 'New Line'}
                            </h1>
                            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200">
                                {editingLine.number || '###'}
                            </Badge>
                        </div>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </div>

                <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
                    <Tabs defaultValue="map" className="space-y-6">
                        <TabsList className="bg-white border border-slate-200 p-1">
                            <TabsTrigger value="details">Line Details</TabsTrigger>
                            <TabsTrigger value="map">Map & Stations</TabsTrigger>
                            <TabsTrigger value="resources">Resources</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details">
                            <Card>
                                <CardHeader>
                                    <CardTitle>General Information</CardTitle>
                                    <CardDescription>Basic details about the bus line.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 max-w-md">
                                    <div className="space-y-2">
                                        <Label>Line Number</Label>
                                        <Input
                                            value={editingLine.number}
                                            onChange={(e) => setEditingLine({ ...editingLine, number: e.target.value })}
                                            placeholder="e.g. 101"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Line Name</Label>
                                        <Input
                                            value={editingLine.name}
                                            onChange={(e) => setEditingLine({ ...editingLine, name: e.target.value })}
                                            placeholder="e.g. Downtown Express"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Schedule / Frequency</Label>
                                        <Input
                                            value={editingLine.schedule}
                                            onChange={(e) => setEditingLine({ ...editingLine, schedule: e.target.value })}
                                            placeholder="e.g. Every 15 mins"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Theme Color</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="color"
                                                value={editingLine.color}
                                                onChange={(e) => setEditingLine({ ...editingLine, color: e.target.value })}
                                                className="w-12 p-1 h-10"
                                            />
                                            <Input
                                                value={editingLine.color}
                                                onChange={(e) => setEditingLine({ ...editingLine, color: e.target.value })}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="map" className="h-[calc(100vh-250px)] min-h-[600px]">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                                {/* Station List */}
                                <Card className="lg:col-span-1 flex flex-col h-full overflow-hidden">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Stations ({editingLine.stations.length})</CardTitle>
                                        <CardDescription className="text-xs">
                                            Drag markers on map to move. Click map to add.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-y-auto p-0">
                                        <div className="divide-y divide-slate-100">
                                            {editingLine.stations.map((station, index) => (
                                                <div key={station.id || index} className="p-3 hover:bg-slate-50 flex items-center gap-2 group">
                                                    <div className="flex flex-col gap-1 text-slate-400">
                                                        <button
                                                            onClick={() => moveStation(index, 'up')}
                                                            disabled={index === 0}
                                                            className="hover:text-blue-600 disabled:opacity-30"
                                                        >
                                                            <ArrowUp className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => moveStation(index, 'down')}
                                                            disabled={index === editingLine.stations.length - 1}
                                                            className="hover:text-blue-600 disabled:opacity-30"
                                                        >
                                                            <ArrowDown className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center border-slate-300 text-slate-500 text-xs">
                                                                {index + 1}
                                                            </Badge>
                                                            <span className="text-xs text-slate-400 font-mono">
                                                                {station.coordinates[0].toFixed(4)}, {station.coordinates[1].toFixed(4)}
                                                            </span>
                                                        </div>
                                                        <Input
                                                            value={station.name}
                                                            onChange={(e) => updateStationName(station.id, e.target.value)}
                                                            className="h-8 text-sm"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeStation(station.id)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {editingLine.stations.length === 0 && (
                                                <div className="p-8 text-center text-slate-400 text-sm">
                                                    No stations yet. Click on the map to add one.
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Map Editor */}
                                <Card className="lg:col-span-2 h-full overflow-hidden border-0 shadow-lg">
                                    <LineEditorMap
                                        stations={editingLine.stations}
                                        onStationsChange={(newStations) => setEditingLine({ ...editingLine, stations: newStations })}
                                    />
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="resources">
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Bus className="h-5 w-5 text-blue-600" />
                                            <CardTitle>Assigned Buses</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Placeholder for assigned buses */}
                                            <div className="text-center py-4 text-slate-500 text-sm">
                                                Vehicle assignment will be implemented in a future update.
                                            </div>
                                            <Button variant="outline" className="w-full border-dashed" disabled>
                                                <Plus className="h-4 w-4 mr-2" /> Assign Bus
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <User className="h-5 w-5 text-blue-600" />
                                            <CardTitle>Assigned Drivers</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* Placeholder for assigned drivers */}
                                            <div className="text-center py-4 text-slate-500 text-sm">
                                                Driver assignment will be implemented in a future update.
                                            </div>
                                            <Button variant="outline" className="w-full border-dashed" disabled>
                                                <Plus className="h-4 w-4 mr-2" /> Assign Driver
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Manage Lines</h1>
                    <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Line
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Active Lines</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="text-center py-8 text-slate-500">Loading lines...</div>
                        ) : lines.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No lines found.</div>
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
                                                <Badge className="text-white" style={{ backgroundColor: line.color }}>{line.number}</Badge>
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
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(line)}>
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
