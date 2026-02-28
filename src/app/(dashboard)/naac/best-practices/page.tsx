'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import bestPracticeService, { BestPractice } from '@/lib/services/bestPracticeService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, Edit3, Trash2, Save, X, Loader2, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

interface FormData {
    title: string;
    objectives: string;
    context: string;
    practice: string;
    evidenceOfSuccess: string;
    problemsEncountered: string;
    resourcesRequired: string;
    notes: string;
}

const empty: FormData = {
    title: '', objectives: '', context: '', practice: '',
    evidenceOfSuccess: '', problemsEncountered: '', resourcesRequired: '', notes: '',
};

const FIELDS: { key: keyof FormData; label: string; type: 'input' | 'textarea'; required?: boolean }[] = [
    { key: 'title', label: 'Title of the Practice', type: 'input', required: true },
    { key: 'objectives', label: 'Objectives of the Practice', type: 'textarea', required: true },
    { key: 'context', label: 'The Context', type: 'textarea' },
    { key: 'practice', label: 'The Practice', type: 'textarea', required: true },
    { key: 'evidenceOfSuccess', label: 'Evidence of Success', type: 'textarea' },
    { key: 'problemsEncountered', label: 'Problems Encountered & Resources Required', type: 'textarea' },
    { key: 'resourcesRequired', label: 'Resources Required', type: 'textarea' },
    { key: 'notes', label: 'Additional Notes', type: 'textarea' },
];

export default function BestPracticesPage() {
    const [practices, setPractices] = useState<BestPractice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormData>(empty);
    const [saving, setSaving] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const res = await bestPracticeService.getAll();
            const d = res.data as unknown as Record<string, unknown>;
            setPractices((d.data as BestPractice[]) || (res.data as unknown as BestPractice[]));
        } catch {
            toast.error('Failed to load best practices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.objectives || !form.practice) {
            toast.error('Title, Objectives, and Practice are required');
            return;
        }
        setSaving(true);
        try {
            if (editId) {
                await bestPracticeService.update(editId, form);
                toast.success('Best practice updated');
            } else {
                await bestPracticeService.create(form);
                toast.success('Best practice created');
            }
            setShowForm(false);
            setEditId(null);
            setForm(empty);
            fetchData();
        } catch {
            toast.error('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (bp: BestPractice) => {
        setForm({
            title: bp.title, objectives: bp.objectives, context: bp.context || '',
            practice: bp.practice, evidenceOfSuccess: bp.evidenceOfSuccess || '',
            problemsEncountered: bp.problemsEncountered || '', resourcesRequired: bp.resourcesRequired || '',
            notes: bp.notes || '',
        });
        setEditId(bp.id);
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this best practice?')) return;
        try {
            await bestPracticeService.delete(id);
            toast.success('Deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Star className="h-8 w-8" />
                        Best Practices
                    </h1>
                    <p className="text-muted-foreground mt-1">Document institutional best practices for NAAC Criterion 7.2</p>
                </div>
                <Button onClick={() => { setShowForm(true); setEditId(null); setForm(empty); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Practice
                </Button>
            </motion.div>

            {/* Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="border-border/50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{editId ? 'Edit Best Practice' : 'Add Best Practice'}</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => { setShowForm(false); setEditId(null); setForm(empty); }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {FIELDS.map(({ key, label, type, required }) => (
                                        <div key={key} className="space-y-2">
                                            <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
                                            {type === 'input' ? (
                                                <Input
                                                    value={form[key]}
                                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                                    required={required}
                                                />
                                            ) : (
                                                <Textarea
                                                    value={form[key]}
                                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                                    rows={3}
                                                    required={required}
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex gap-3">
                                        <Button type="submit" disabled={saving}>
                                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                            {editId ? 'Update' : 'Save'}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List */}
            {practices.length === 0 && !showForm ? (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardContent className="p-12 text-center">
                            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium">No best practices documented</h3>
                            <p className="text-sm text-muted-foreground mt-1">Start by adding your institution&apos;s best practices for NAAC</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div variants={stagger} className="space-y-4">
                    {practices.map((bp, i) => (
                        <motion.div key={bp.id} variants={fadeIn}>
                            <Card className="border-border/50 hover:border-border transition-all">
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => setExpandedId(expandedId === bp.id ? null : bp.id)}>
                                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                                #{i + 1}
                                            </Badge>
                                            <div>
                                                <h3 className="font-semibold">{bp.title}</h3>
                                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{bp.objectives}</p>
                                            </div>
                                            {expandedId === bp.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                        </div>
                                        <div className="flex gap-1 ml-4">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(bp)}>
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-500" onClick={() => handleDelete(bp.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {expandedId === bp.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 pt-4 border-t border-border/50 space-y-4"
                                            >
                                                {[
                                                    { label: 'Objectives', value: bp.objectives },
                                                    { label: 'Context', value: bp.context },
                                                    { label: 'The Practice', value: bp.practice },
                                                    { label: 'Evidence of Success', value: bp.evidenceOfSuccess },
                                                    { label: 'Problems Encountered', value: bp.problemsEncountered },
                                                    { label: 'Resources Required', value: bp.resourcesRequired },
                                                    { label: 'Notes', value: bp.notes },
                                                ].filter((f) => f.value).map((field) => (
                                                    <div key={field.label}>
                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</p>
                                                        <p className="text-sm mt-1 whitespace-pre-wrap">{field.value}</p>
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
}
