'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Plus, CheckSquare, Clock, AlertCircle, Users, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { hodService, HodTask, HodSubmission } from '@/lib/services/hodService';

export default function HodDashboardPage() {
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<HodSubmission | null>(null);
    const [taskForm, setTaskForm] = useState({ assignedToId: '', title: '', description: '', criterionRef: '', framework: '', deadline: '' });
    const [reviewForm, setReviewForm] = useState({ status: 'APPROVED', reviewComment: '' });

    const load = async () => {
        try {
            const res = await hodService.getHodDashboard();
            setDashboard(res.data.data);
        } catch { toast.error('Failed to load dashboard'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleCreateTask = async () => {
        try {
            await hodService.createTask(taskForm);
            toast.success('Task assigned');
            setTaskDialogOpen(false);
            setTaskForm({ assignedToId: '', title: '', description: '', criterionRef: '', framework: '', deadline: '' });
            load();
        } catch { toast.error('Failed to create task'); }
    };

    const handleReview = async () => {
        if (!selectedSubmission) return;
        try {
            await hodService.reviewSubmission(selectedSubmission.id, reviewForm);
            toast.success('Submission reviewed');
            setReviewDialogOpen(false);
            setSelectedSubmission(null);
            setReviewForm({ status: 'APPROVED', reviewComment: '' });
            load();
        } catch { toast.error('Failed to review'); }
    };

    if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

    const stats = dashboard?.stats || {};
    const tasks = dashboard?.tasks || [];
    const submissions = dashboard?.pendingSubmissions || [];
    const faculty = dashboard?.faculty || [];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">HOD Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Manage department data collection tasks</p>
                    </div>
                    <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
                        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Assign Task</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Assign Task</DialogTitle><DialogDescription>Assign a data collection task to faculty.</DialogDescription></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2"><Label>Title *</Label><Input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Submit research publications data" /></div>
                                <div className="grid gap-2"><Label>Description</Label><Textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Faculty *</Label>
                                    <Select value={taskForm.assignedToId} onValueChange={v => setTaskForm({ ...taskForm, assignedToId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select faculty" /></SelectTrigger>
                                        <SelectContent>{faculty.map((f: any) => <SelectItem key={f.id} value={f.id}>{f.firstName} {f.lastName}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2"><Label>Framework</Label>
                                        <Select value={taskForm.framework} onValueChange={v => setTaskForm({ ...taskForm, framework: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NAAC">NAAC</SelectItem>
                                                <SelectItem value="NBA">NBA</SelectItem>
                                                <SelectItem value="NIRF">NIRF</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2"><Label>Criterion</Label><Input value={taskForm.criterionRef} onChange={e => setTaskForm({ ...taskForm, criterionRef: e.target.value })} placeholder="2.3.1" /></div>
                                </div>
                                <div className="grid gap-2"><Label>Deadline</Label><Input type="datetime-local" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} /></div>
                            </div>
                            <DialogFooter><Button onClick={handleCreateTask} disabled={!taskForm.title || !taskForm.assignedToId}>Assign</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Tasks', value: stats.totalTasks || 0, icon: CheckSquare, color: 'bg-blue-500/20 text-blue-400' },
                        { label: 'Pending', value: stats.pending || 0, icon: Clock, color: 'bg-amber-500/20 text-amber-400' },
                        { label: 'Completed', value: stats.completed || 0, icon: CheckSquare, color: 'bg-emerald-500/20 text-emerald-400' },
                        { label: 'Pending Reviews', value: submissions.length, icon: AlertCircle, color: 'bg-purple-500/20 text-purple-400' },
                    ].map(s => (
                        <Card key={s.label} className="bg-card/50 backdrop-blur">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}><s.icon className="h-5 w-5" /></div>
                                <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <Card>
                        <CardHeader><CardTitle>Assigned Tasks</CardTitle><CardDescription>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</CardDescription></CardHeader>
                        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                            {tasks.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8 text-sm">No tasks assigned yet</p>
                            ) : tasks.map((t: HodTask) => (
                                <div key={t.id} className="p-3 rounded-lg bg-muted/30">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">{t.title}</p>
                                        <Badge variant="outline" className={t.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : t.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400' : ''}>
                                            {t.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span>{t.assignedTo?.firstName} {t.assignedTo?.lastName}</span>
                                        {t.criterionRef && <Badge variant="outline" className="text-[10px]">{t.framework} {t.criterionRef}</Badge>}
                                        {t.deadline && <span>Due: {new Date(t.deadline).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pending Submissions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                    <Card>
                        <CardHeader><CardTitle>Pending Reviews</CardTitle><CardDescription>{submissions.length} submission{submissions.length !== 1 ? 's' : ''} awaiting review</CardDescription></CardHeader>
                        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                            {submissions.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8 text-sm">No pending submissions</p>
                            ) : submissions.map((s: HodSubmission) => (
                                <div key={s.id} className="p-3 rounded-lg bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => { setSelectedSubmission(s); setReviewDialogOpen(true); }}>
                                    <p className="text-sm font-medium">{s.task?.title || 'Task submission'}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span>By: {s.submittedBy?.firstName} {s.submittedBy?.lastName}</span>
                                        <span>• {new Date(s.submittedAt).toLocaleDateString()}</span>
                                    </div>
                                    {s.dataValue && <p className="text-xs text-muted-foreground mt-1 truncate">{s.dataValue}</p>}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Review Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={(o) => { setReviewDialogOpen(o); if (!o) setSelectedSubmission(null); }}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Review Submission</DialogTitle></DialogHeader>
                    {selectedSubmission && (
                        <div className="space-y-4 py-4">
                            <div className="p-3 rounded bg-muted/50">
                                <p className="text-sm font-medium">{selectedSubmission.task?.title}</p>
                                {selectedSubmission.dataValue && <p className="text-sm mt-2">{selectedSubmission.dataValue}</p>}
                                {selectedSubmission.documentUrls?.length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-2">{selectedSubmission.documentUrls.length} document(s) attached</p>
                                )}
                            </div>
                            <div className="grid gap-2"><Label>Decision *</Label>
                                <Select value={reviewForm.status} onValueChange={v => setReviewForm({ ...reviewForm, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="APPROVED">Approve</SelectItem>
                                        <SelectItem value="REJECTED">Reject</SelectItem>
                                        <SelectItem value="REVISION_REQUESTED">Request Revision</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2"><Label>Comment</Label><Textarea value={reviewForm.reviewComment} onChange={e => setReviewForm({ ...reviewForm, reviewComment: e.target.value })} /></div>
                        </div>
                    )}
                    <DialogFooter><Button onClick={handleReview}>Submit Review</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
