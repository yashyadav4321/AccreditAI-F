'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dvvService, { DvvQuery, DvvSummary } from '@/lib/services/dvvService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    ClipboardCheck, Plus, Save, X, Loader2, Trash2, Edit3,
    AlertCircle, Clock, CheckCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const STATUS_MAP: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    PENDING: { icon: <Clock className="h-4 w-4" />, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'Pending' },
    IN_PROGRESS: { icon: <AlertCircle className="h-4 w-4" />, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'In Progress' },
    RESOLVED: { icon: <CheckCircle className="h-4 w-4" />, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', label: 'Resolved' },
};

const PRIORITY_MAP: Record<string, string> = {
    LOW: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    HIGH: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function DvvPage() {
    const [queries, setQueries] = useState<DvvQuery[]>([]);
    const [summary, setSummary] = useState<DvvSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [form, setForm] = useState<{
        queryNumber: string; criterionRef: string; queryText: string; responseText: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH'; status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'; deadline: string;
    }>({
        queryNumber: '', criterionRef: '', queryText: '', responseText: '',
        priority: 'MEDIUM', status: 'PENDING', deadline: '',
    });

    const fetchData = useCallback(async () => {
        try {
            const [qRes, sRes] = await Promise.all([dvvService.getAll(), dvvService.getSummary()]);
            const qd = qRes.data as unknown as Record<string, unknown>;
            const sd = sRes.data as unknown as Record<string, unknown>;
            setQueries((qd.data as DvvQuery[]) || (qRes.data as unknown as DvvQuery[]));
            setSummary((sd.data as DvvSummary) || (sRes.data as unknown as DvvSummary));
        } catch {
            toast.error('Failed to load DVV data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.queryNumber || !form.queryText) {
            toast.error('Query number and text are required');
            return;
        }
        setSaving(true);
        try {
            if (editId) {
                await dvvService.update(editId, form);
                toast.success('Query updated');
            } else {
                await dvvService.create(form);
                toast.success('Query added');
            }
            setShowForm(false);
            setEditId(null);
            setForm({ queryNumber: '', criterionRef: '', queryText: '', responseText: '', priority: 'MEDIUM', status: 'PENDING', deadline: '' });
            fetchData();
        } catch {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (q: DvvQuery) => {
        setForm({
            queryNumber: q.queryNumber, criterionRef: q.criterionRef || '',
            queryText: q.queryText, responseText: q.responseText || '',
            priority: q.priority, status: q.status,
            deadline: q.deadline ? q.deadline.substring(0, 10) : '',
        });
        setEditId(q.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this DVV query?')) return;
        try {
            await dvvService.delete(id);
            toast.success('Deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await dvvService.update(id, { status } as Partial<DvvQuery>);
            toast.success(`Status updated to ${STATUS_MAP[status]?.label || status}`);
            fetchData();
        } catch {
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <ClipboardCheck className="h-8 w-8" />
                        DVV Management
                    </h1>
                    <p className="text-muted-foreground mt-1">Track Data Verification & Validation queries</p>
                </div>
                <Button onClick={() => { setShowForm(true); setEditId(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Query
                </Button>
            </motion.div>

            {/* Summary Cards */}
            {summary && (
                <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Queries', value: summary.total, color: 'text-foreground' },
                        { label: 'Pending', value: summary.pending, color: 'text-amber-500' },
                        { label: 'In Progress', value: summary.inProgress, color: 'text-blue-500' },
                        { label: 'Resolved', value: summary.resolved, color: 'text-emerald-500' },
                    ].map((stat) => (
                        <Card key={stat.label} className="border-border/50">
                            <CardContent className="p-4 text-center">
                                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            )}

            {summary && summary.total > 0 && (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Completion Progress</span>
                                <span className="text-sm font-bold">{summary.completionPercentage}%</span>
                            </div>
                            <Progress value={summary.completionPercentage} className="h-3" />
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <Card className="border-border/50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{editId ? 'Edit DVV Query' : 'Add DVV Query'}</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Query Number <span className="text-red-500">*</span></Label>
                                            <Input placeholder="DVV-1" value={form.queryNumber} onChange={(e) => setForm({ ...form, queryNumber: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Criterion Reference</Label>
                                            <Input placeholder="1.2.1" value={form.criterionRef} onChange={(e) => setForm({ ...form, criterionRef: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Deadline</Label>
                                            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Priority</Label>
                                            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                            </select>
                                        </div>
                                        {editId && (
                                            <div className="space-y-2">
                                                <Label>Status</Label>
                                                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' })} className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm">
                                                    <option value="PENDING">Pending</option>
                                                    <option value="IN_PROGRESS">In Progress</option>
                                                    <option value="RESOLVED">Resolved</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Query Text <span className="text-red-500">*</span></Label>
                                        <Textarea rows={3} value={form.queryText} onChange={(e) => setForm({ ...form, queryText: e.target.value })} required />
                                    </div>
                                    {editId && (
                                        <div className="space-y-2">
                                            <Label>Response</Label>
                                            <Textarea rows={3} value={form.responseText} onChange={(e) => setForm({ ...form, responseText: e.target.value })} />
                                        </div>
                                    )}
                                    <div className="flex gap-3">
                                        <Button type="submit" disabled={saving}>
                                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                            {editId ? 'Update' : 'Save'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Query List */}
            <motion.div variants={stagger} className="space-y-3">
                {queries.length === 0 && !showForm ? (
                    <Card className="border-border/50">
                        <CardContent className="p-12 text-center">
                            <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium">No DVV queries</h3>
                            <p className="text-sm text-muted-foreground mt-1">Add queries as they come in from the DVV process</p>
                        </CardContent>
                    </Card>
                ) : queries.map((q) => {
                    const statusCfg = STATUS_MAP[q.status] || STATUS_MAP.PENDING;
                    return (
                        <motion.div key={q.id} variants={fadeIn}>
                            <Card className="border-border/50 hover:border-border transition-all">
                                <CardContent className="p-4">
                                    <div className="space-y-2">
                                        {/* Top row: badges + actions */}
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className="font-mono shrink-0">{q.queryNumber}</Badge>
                                                {q.criterionRef && <Badge variant="outline" className="text-xs shrink-0">{q.criterionRef}</Badge>}
                                                <Badge variant="outline" className={`shrink-0 ${PRIORITY_MAP[q.priority]}`}>{q.priority}</Badge>
                                                <Badge variant="outline" className={`shrink-0 ${statusCfg.color}`}>
                                                    {statusCfg.icon}
                                                    <span className="ml-1">{statusCfg.label}</span>
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {q.status !== 'RESOLVED' && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleStatusChange(q.id, q.status === 'PENDING' ? 'IN_PROGRESS' : 'RESOLVED')}>
                                                        {q.status === 'PENDING' ? 'Start' : 'Resolve'}
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(q)}>
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500" onClick={() => handleDelete(q.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        {/* Query text row — clickable to expand */}
                                        <div className="flex items-start gap-2 cursor-pointer" onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}>
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 flex-1">{q.queryText}</p>
                                            {expandedId === q.id ? <ChevronUp className="h-4 w-4 mt-0.5 shrink-0" /> : <ChevronDown className="h-4 w-4 mt-0.5 shrink-0" />}
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {expandedId === q.id && (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border/50 space-y-3">
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Full Query</p>
                                                    <p className="text-sm mt-1 whitespace-pre-wrap">{q.queryText}</p>
                                                </div>
                                                {q.responseText && (
                                                    <div>
                                                        <p className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Response</p>
                                                        <p className="text-sm mt-1 whitespace-pre-wrap">{q.responseText}</p>
                                                    </div>
                                                )}
                                                {q.deadline && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Deadline: {new Date(q.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </p>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
