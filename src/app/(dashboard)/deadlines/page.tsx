'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import deadlineService, { Deadline } from '@/lib/services/deadlineService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Plus, Clock, AlertTriangle, CheckCircle2, Loader2, Trash2 } from 'lucide-react';
import { format, isPast, differenceInDays } from 'date-fns';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

export default function DeadlinesPage() {
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState<{ title: string; description: string; framework: string; priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'; dueDate: string }>({ title: '', description: '', framework: 'NAAC', priority: 'MEDIUM', dueDate: '' });

    const fetchDeadlines = async () => {
        try {
            const res = await deadlineService.list();
            const d = res.data as unknown as Record<string, unknown>;
            setDeadlines((d.data as Deadline[]) || (Array.isArray(d) ? d as unknown as Deadline[] : []));
        } catch { toast.error('Failed to load deadlines'); } finally { setLoading(false); }
    };

    useEffect(() => { fetchDeadlines(); }, []);

    const handleAdd = async () => {
        if (!form.title || !form.dueDate) { toast.error('Title and due date required'); return; }
        setAdding(true);
        try {
            await deadlineService.create(form);
            toast.success('Deadline created');
            setAddOpen(false);
            setForm({ title: '', description: '', framework: 'NAAC', priority: 'MEDIUM', dueDate: '' });
            fetchDeadlines();
        } catch { toast.error('Failed to create deadline'); } finally { setAdding(false); }
    };

    const handleDelete = async (id: string) => {
        try { await deadlineService.delete(id); toast.success('Deleted'); fetchDeadlines(); } catch { toast.error('Delete failed'); }
    };

    const priorityColor = (p: string) => {
        switch (p) { case 'HIGH': return 'bg-red-500'; case 'MEDIUM': return 'bg-amber-500'; case 'LOW': return 'bg-blue-500'; default: return 'bg-muted'; }
    };

    const overdue = deadlines.filter(d => isPast(new Date(d.dueDate)) && !d.isCompleted);
    const upcoming = deadlines.filter(d => !isPast(new Date(d.dueDate)));
    const completed = deadlines.filter(d => d.isCompleted);

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-80" /></div>;

    const renderDeadlineCard = (dl: Deadline) => {
        const days = differenceInDays(new Date(dl.dueDate), new Date());
        const isOverdue = days < 0;
        return (
            <motion.div key={dl.id} variants={fadeIn}>
                <div className={`flex items-center justify-between p-4 rounded-xl border ${isOverdue ? 'border-red-500/30 bg-red-500/5' : 'border-border/50'} hover:bg-muted/30 transition-colors`}>
                    <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full ${priorityColor(dl.priority)}`} />
                        <div>
                            <p className="font-medium">{dl.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Badge variant="outline" className="text-xs">{dl.framework}</Badge>
                                <span>•</span>
                                <span>{format(new Date(dl.dueDate), 'MMM d, yyyy')}</span>
                                {isOverdue ? <Badge className="bg-red-500 text-white border-0 text-xs">Overdue</Badge> : days <= 7 && <Badge className="bg-amber-500 text-white border-0 text-xs">{days}d left</Badge>}
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(dl.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
            </motion.div>
        );
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Deadlines</h1>
                    <p className="text-muted-foreground mt-1">Track accreditation submission deadlines</p>
                </div>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild><Button className="bg-foreground text-background hover:bg-foreground/90"><Plus className="mr-2 h-4 w-4" />Add Deadline</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create Deadline</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Framework</Label>
                                    <Select value={form.framework} onValueChange={v => setForm({ ...form, framework: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NAAC">NAAC</SelectItem><SelectItem value="NBA">NBA</SelectItem><SelectItem value="NIRF">NIRF</SelectItem></SelectContent></Select>
                                </div>
                                <div className="space-y-2"><Label>Priority</Label>
                                    <Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="LOW">Low</SelectItem><SelectItem value="MEDIUM">Medium</SelectItem><SelectItem value="HIGH">High</SelectItem></SelectContent></Select>
                                </div>
                            </div>
                            <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></div>
                            <Button onClick={handleAdd} disabled={adding} className="w-full bg-foreground text-background hover:bg-foreground/90">
                                {adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Deadline'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeIn} className="grid grid-cols-3 gap-4">
                <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3"><AlertTriangle className="h-8 w-8 text-red-500" /><div><p className="text-2xl font-bold">{overdue.length}</p><p className="text-xs text-muted-foreground">Overdue</p></div></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3"><Clock className="h-8 w-8 text-amber-500" /><div><p className="text-2xl font-bold">{upcoming.length}</p><p className="text-xs text-muted-foreground">Upcoming</p></div></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-4 flex items-center gap-3"><CheckCircle2 className="h-8 w-8 text-emerald-500" /><div><p className="text-2xl font-bold">{completed.length}</p><p className="text-xs text-muted-foreground">Completed</p></div></CardContent></Card>
            </motion.div>

            {/* Overdue */}
            {overdue.length > 0 && (
                <motion.div variants={fadeIn}>
                    <Card className="border-red-500/30">
                        <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-red-500"><AlertTriangle className="h-5 w-5" />Overdue ({overdue.length})</CardTitle></CardHeader>
                        <CardContent className="space-y-2">{overdue.map(renderDeadlineCard)}</CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Upcoming */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-foreground" />Upcoming ({upcoming.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {upcoming.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">No upcoming deadlines</p> : upcoming.map(renderDeadlineCard)}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
