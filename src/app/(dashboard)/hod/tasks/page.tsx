'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Upload, Clock, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { hodService, HodTask } from '@/lib/services/hodService';

export default function HodTasksPage() {
    const [tasks, setTasks] = useState<HodTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<HodTask | null>(null);
    const [submitForm, setSubmitForm] = useState({ dataValue: '' });

    const load = async () => {
        try {
            const res = await hodService.getFacultyTasks();
            setTasks(res.data.data || []);
        } catch { toast.error('Failed to load tasks'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        if (!selectedTask) return;
        try {
            await hodService.submitData(selectedTask.id, submitForm);
            toast.success('Data submitted for review');
            setSubmitDialogOpen(false);
            setSelectedTask(null);
            setSubmitForm({ dataValue: '' });
            load();
        } catch { toast.error('Failed to submit'); }
    };

    const statusColors: Record<string, string> = {
        PENDING: 'bg-amber-500/10 text-amber-400',
        IN_PROGRESS: 'bg-blue-500/10 text-blue-400',
        COMPLETED: 'bg-emerald-500/10 text-emerald-400',
        OVERDUE: 'bg-red-500/10 text-red-400',
    };

    const pendingCount = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
    const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
                <p className="text-muted-foreground mt-1">Tasks assigned by your department HOD</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-card/50 backdrop-blur">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/20"><CheckSquare className="h-5 w-5 text-blue-400" /></div>
                            <div><p className="text-2xl font-bold">{tasks.length}</p><p className="text-xs text-muted-foreground">Total Tasks</p></div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-amber-500/20"><Clock className="h-5 w-5 text-amber-400" /></div>
                            <div><p className="text-2xl font-bold">{pendingCount}</p><p className="text-xs text-muted-foreground">Pending</p></div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-500/20"><CheckSquare className="h-5 w-5 text-emerald-400" /></div>
                            <div><p className="text-2xl font-bold">{completedCount}</p><p className="text-xs text-muted-foreground">Completed</p></div>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                ) : tasks.length === 0 ? (
                    <Card className="bg-card/50"><CardContent className="p-12 text-center">
                        <CheckSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No tasks assigned to you yet.</p>
                    </CardContent></Card>
                ) : (
                    <div className="space-y-3">
                        {tasks.map(t => (
                            <Card key={t.id} className={`transition-all ${t.status === 'COMPLETED' ? 'opacity-60' : ''}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-sm">{t.title}</h3>
                                                <Badge variant="outline" className={statusColors[t.status] || ''}>{t.status.replace('_', ' ')}</Badge>
                                                {t.criterionRef && <Badge variant="outline" className="text-[10px]">{t.framework} {t.criterionRef}</Badge>}
                                            </div>
                                            {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                                            {t.deadline && (
                                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />Due: {new Date(t.deadline).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                                </p>
                                            )}
                                        </div>
                                        {t.status !== 'COMPLETED' && (
                                            <Button size="sm" onClick={() => { setSelectedTask(t); setSubmitDialogOpen(true); }}>
                                                <Upload className="h-4 w-4 mr-2" />Submit
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </motion.div>

            <Dialog open={submitDialogOpen} onOpenChange={(o) => { setSubmitDialogOpen(o); if (!o) setSelectedTask(null); }}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Submit Data</DialogTitle><DialogDescription>{selectedTask?.title}</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Data / Response</Label>
                            <Textarea value={submitForm.dataValue} onChange={e => setSubmitForm({ dataValue: e.target.value })} rows={5} placeholder="Enter the requested data here..." />
                        </div>
                    </div>
                    <DialogFooter><Button onClick={handleSubmit} disabled={!submitForm.dataValue}>Submit for Review</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
