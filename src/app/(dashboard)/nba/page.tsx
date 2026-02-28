'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import nbaService, { NbaProgram } from '@/lib/services/nbaService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

export default function NbaPage() {
    const [programs, setPrograms] = useState<NbaProgram[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: '', code: '', level: 'UG', duration: 4 });

    const fetchPrograms = async () => {
        try {
            const res = await nbaService.getPrograms();
            const d = res.data as unknown as Record<string, unknown>;
            setPrograms((d.data as NbaProgram[]) || (Array.isArray(d) ? (d as unknown as NbaProgram[]) : []));
        } catch { toast.error('Failed to load programs'); } finally { setLoading(false); }
    };

    useEffect(() => { fetchPrograms(); }, []);

    const handleCreate = async () => {
        if (!form.name || !form.code) { toast.error('Fill all required fields'); return; }
        setCreating(true);
        try {
            await nbaService.createProgram({ name: form.name, code: form.code, level: form.level, duration: form.duration });
            toast.success('Program created');
            setDialogOpen(false);
            setForm({ name: '', code: '', level: 'UG', duration: 4 });
            fetchPrograms();
        } catch { toast.error('Failed to create program'); } finally { setCreating(false); }
    };

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48" />)}</div></div>;

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">NBA Accreditation</h1>
                    <p className="text-muted-foreground mt-1">Manage program-level NBA accreditation</p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-foreground text-background hover:bg-foreground/90"><Plus className="mr-2 h-4 w-4" />Add Program</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create NBA Program</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Program Name</Label><Input placeholder="B.Tech Computer Science" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Program Code</Label><Input placeholder="CSE" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Level</Label>
                                    <Select value={form.level} onValueChange={v => setForm({ ...form, level: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent><SelectItem value="UG">Undergraduate</SelectItem><SelectItem value="PG">Postgraduate</SelectItem></SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2"><Label>Duration (years)</Label><Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} /></div>
                            <Button onClick={handleCreate} disabled={creating} className="w-full bg-foreground text-background hover:bg-foreground/90">
                                {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : 'Create Program'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {programs.length === 0 ? (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50"><CardContent className="p-12 text-center">
                        <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-1">No programs yet</h3>
                        <p className="text-sm text-muted-foreground">Add your first NBA program to get started.</p>
                    </CardContent></Card>
                </motion.div>
            ) : (
                <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.map(prog => {
                        const raw = prog as unknown as Record<string, unknown>;
                        const pName = (raw.programName as string) || prog.name || 'Untitled Program';
                        const pCode = (raw.programCode as string) || prog.code || '';
                        const pLevel = prog.level || '';
                        const pDuration = prog.duration || 0;
                        const deptName = (raw.department as { name?: string })?.name || prog.departmentName || '';

                        return (
                            <motion.div key={prog.id} variants={fadeIn}>
                                <Link href={`/nba/${prog.id}`}>
                                    <Card className="group hover:shadow-lg hover:border-border transition-all duration-300 cursor-pointer border-border/50 h-full">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="secondary">{pLevel}</Badge>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </div>
                                            <CardTitle className="text-lg mt-2">{pName}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                {pCode && <span>Code: {pCode}</span>}
                                                {pDuration > 0 && <span>{pDuration} years</span>}
                                            </div>
                                            {deptName && <p className="text-xs text-muted-foreground mt-2">{deptName}</p>}
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </motion.div>
    );
}
