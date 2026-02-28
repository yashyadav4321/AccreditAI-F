'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import facultyService from '@/lib/services/facultyService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Award, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Fdp { id: string; title: string; organization: string; duration: string; year: number; type: string; certificate?: boolean; }

export default function FdpPage() {
    const [fdps, setFdps] = useState<Fdp[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ title: '', organization: '', duration: '', year: new Date().getFullYear(), type: 'FDP' });

    const fetchFdps = async () => {
        try { const res = await facultyService.getFdp(); const d = res.data as unknown as Record<string, unknown>; setFdps((d.data as Fdp[]) || []); } catch { } finally { setLoading(false); }
    };
    useEffect(() => { fetchFdps(); }, []);

    const handleAdd = async () => {
        if (!form.title) { toast.error('Title required'); return; }
        setAdding(true);
        try { await facultyService.addFdp(form as any); toast.success('FDP added'); setAddOpen(false); fetchFdps(); } catch { toast.error('Failed'); } finally { setAdding(false); }
    };
    const handleDelete = async (id: string) => {
        try { await facultyService.deleteFDP(id); toast.success('Deleted'); fetchFdps(); } catch { toast.error('Failed'); }
    };

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-80" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">FDP & Workshops</h1><p className="text-muted-foreground mt-1">{fdps.length} records</p></div>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild><Button className="bg-foreground text-background hover:bg-foreground/90"><Plus className="mr-2 h-4 w-4" />Add FDP</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Add FDP / Workshop</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Organization</Label><Input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} /></div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Duration</Label><Input value={form.duration} placeholder="5 days" onChange={e => setForm({ ...form, duration: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} /></div>
                                <div className="space-y-2"><Label>Type</Label><Input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} /></div>
                            </div>
                            <Button onClick={handleAdd} disabled={adding} className="w-full bg-foreground text-background hover:bg-foreground/90">{adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : 'Add FDP'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50"><CardContent className="p-0">
                {fdps.length === 0 ? (
                    <div className="py-16 text-center"><Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold">No FDPs yet</h3><p className="text-sm text-muted-foreground">Add FDPs and workshops you&apos;ve attended.</p></div>
                ) : (
                    <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Organization</TableHead><TableHead>Duration</TableHead><TableHead>Year</TableHead><TableHead>Type</TableHead><TableHead></TableHead></TableRow></TableHeader>
                        <TableBody>{fdps.map(f => (
                            <TableRow key={f.id}><TableCell className="font-medium">{f.title}</TableCell><TableCell>{f.organization}</TableCell><TableCell>{f.duration}</TableCell><TableCell>{f.year}</TableCell><TableCell><Badge variant="secondary">{f.type}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell></TableRow>
                        ))}</TableBody>
                    </Table>
                )}
            </CardContent></Card>
        </motion.div>
    );
}
