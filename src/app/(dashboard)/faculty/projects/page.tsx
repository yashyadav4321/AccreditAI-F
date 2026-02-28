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
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Briefcase, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Project { id: string; title: string; fundingAgency: string; amount: number; status: string; startDate: string; endDate?: string; }

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ title: '', fundingAgency: '', amount: 0, startDate: '', endDate: '', status: 'ONGOING' });

    const fetchProjects = async () => {
        try { const res = await facultyService.getProjects(); const d = res.data as unknown as Record<string, unknown>; setProjects((d.data as Project[]) || []); } catch { } finally { setLoading(false); }
    };
    useEffect(() => { fetchProjects(); }, []);

    const handleAdd = async () => {
        if (!form.title) { toast.error('Title required'); return; }
        setAdding(true);
        try { await facultyService.addProject(form); toast.success('Project added'); setAddOpen(false); fetchProjects(); } catch { toast.error('Failed'); } finally { setAdding(false); }
    };
    const handleDelete = async (id: string) => {
        try { await facultyService.deleteProject(id); toast.success('Deleted'); fetchProjects(); } catch { toast.error('Failed'); }
    };

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-80" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">Research Projects</h1><p className="text-muted-foreground mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p></div>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild><Button className="bg-foreground text-background hover:bg-foreground/90"><Plus className="mr-2 h-4 w-4" />Add Project</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Add Research Project</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Funding Agency</Label><Input value={form.fundingAgency} onChange={e => setForm({ ...form, fundingAgency: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
                                <div className="space-y-2"><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
                            </div>
                            <Button onClick={handleAdd} disabled={adding} className="w-full bg-foreground text-background hover:bg-foreground/90">{adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : 'Add Project'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50"><CardContent className="p-0">
                {projects.length === 0 ? (
                    <div className="py-16 text-center"><Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold">No projects yet</h3><p className="text-sm text-muted-foreground">Add your research projects.</p></div>
                ) : (
                    <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Funding</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
                        <TableBody>{projects.map(p => (
                            <TableRow key={p.id}><TableCell className="font-medium">{p.title}</TableCell><TableCell>{p.fundingAgency}</TableCell><TableCell>₹{p.amount?.toLocaleString()}</TableCell><TableCell><Badge variant={p.status === 'COMPLETED' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell></TableRow>
                        ))}</TableBody>
                    </Table>
                )}
            </CardContent></Card>
        </motion.div>
    );
}
