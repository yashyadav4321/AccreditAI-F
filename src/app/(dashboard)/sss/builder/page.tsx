'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Pencil, Trash2, GripVertical, Copy, ExternalLink, Eye, Loader2, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { sssService, SurveyTemplate, SurveyQuestion } from '@/lib/services/sssService';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => `${currentYear - i}-${currentYear - i + 1}`);

export default function SurveyBuilderPage() {
    const [templates, setTemplates] = useState<SurveyTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<SurveyTemplate | null>(null);
    const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
    const [templateForm, setTemplateForm] = useState({ title: '', description: '', academicYear: yearOptions[0] });
    const [questionForm, setQuestionForm] = useState({ questionText: '', questionType: 'RATING' as 'RATING' | 'MULTIPLE_CHOICE' | 'TEXT', isRequired: true });

    const loadTemplates = async () => {
        try {
            const res = await sssService.getTemplates();
            setTemplates(res.data.data || []);
        } catch { toast.error('Failed to load templates'); }
        finally { setLoading(false); }
    };

    const loadQuestions = async (templateId: string) => {
        try {
            const res = await sssService.getQuestions(templateId);
            setQuestions(res.data.data || []);
        } catch { toast.error('Failed to load questions'); }
    };

    useEffect(() => { loadTemplates(); }, []);

    const handleCreateTemplate = async () => {
        try {
            const res = await sssService.createTemplate(templateForm);
            toast.success('Template created');
            setCreateDialogOpen(false);
            setTemplateForm({ title: '', description: '', academicYear: yearOptions[0] });
            loadTemplates();
            setSelectedTemplate(res.data.data);
            loadQuestions(res.data.data.id);
        } catch { toast.error('Failed to create template'); }
    };

    const handleTogglePublish = async (t: SurveyTemplate) => {
        try {
            await sssService.updateTemplate(t.id, { isPublished: !t.isPublished });
            toast.success(t.isPublished ? 'Survey unpublished' : 'Survey published');
            loadTemplates();
        } catch { toast.error('Failed to update'); }
    };

    const handleLoadDefaults = async () => {
        if (!selectedTemplate) return;
        try {
            await sssService.loadDefaults(selectedTemplate.id);
            toast.success('Default SSS questions loaded (22 questions across 6 dimensions)');
            loadQuestions(selectedTemplate.id);
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load defaults'); }
    };

    const handleAddQuestion = async () => {
        if (!selectedTemplate) return;
        try {
            if (editingQuestion) {
                await sssService.updateQuestion(editingQuestion, questionForm);
                toast.success('Question updated');
            } else {
                await sssService.addQuestion(selectedTemplate.id, questionForm);
                toast.success('Question added');
            }
            setQuestionDialogOpen(false);
            setEditingQuestion(null);
            setQuestionForm({ questionText: '', questionType: 'RATING', isRequired: true });
            loadQuestions(selectedTemplate.id);
        } catch { toast.error('Failed to save question'); }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm('Delete this question?')) return;
        try {
            await sssService.deleteQuestion(id);
            toast.success('Question deleted');
            if (selectedTemplate) loadQuestions(selectedTemplate.id);
        } catch { toast.error('Failed to delete'); }
    };

    const copyShareLink = (slug: string) => {
        const url = `${window.location.origin}/survey/${slug}`;
        navigator.clipboard.writeText(url);
        toast.success('Survey link copied to clipboard');
    };

    const selectTemplate = (t: SurveyTemplate) => {
        setSelectedTemplate(t);
        loadQuestions(t.id);
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Student Satisfaction Survey</h1>
                        <p className="text-muted-foreground mt-1">Create and manage surveys for NAAC SSS criterion compliance</p>
                    </div>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="h-4 w-4 mr-2" />New Survey</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Survey Template</DialogTitle>
                                <DialogDescription>Create a new survey template that can be shared with students.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Title *</Label>
                                    <Input value={templateForm.title} onChange={e => setTemplateForm({ ...templateForm, title: e.target.value })} placeholder="SSS 2024-25" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description</Label>
                                    <Textarea value={templateForm.description} onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })} placeholder="Annual student satisfaction survey" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Academic Year</Label>
                                    <Select value={templateForm.academicYear} onValueChange={v => setTemplateForm({ ...templateForm, academicYear: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateTemplate} disabled={!templateForm.title}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Template List */}
                <div className="lg:col-span-1 space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Templates</h2>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                    ) : templates.length === 0 ? (
                        <Card className="bg-card/50">
                            <CardContent className="p-6 text-center text-muted-foreground">
                                <LayoutTemplate className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No templates yet. Create your first survey.</p>
                            </CardContent>
                        </Card>
                    ) : templates.map(t => (
                        <Card key={t.id} className={`cursor-pointer transition-all hover:ring-1 hover:ring-foreground/20 ${selectedTemplate?.id === t.id ? 'ring-1 ring-foreground/40 bg-accent/30' : 'bg-card/50'}`}
                            onClick={() => selectTemplate(t)}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-medium text-sm">{t.title}</h3>
                                    <Badge variant="outline" className={t.isPublished ? 'bg-emerald-500/20 text-emerald-400' : ''}>
                                        {t.isPublished ? 'Live' : 'Draft'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{t.academicYear} • {t._count?.questions || 0} questions • {t._count?.responses || 0} responses</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); copyShareLink(t.shareableSlug); }}>
                                        <Copy className="h-3 w-3 mr-1" />Copy Link
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleTogglePublish(t); }}>
                                        {t.isPublished ? 'Unpublish' : 'Publish'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Question Editor */}
                <div className="lg:col-span-2">
                    {selectedTemplate ? (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{selectedTemplate.title}</CardTitle>
                                        <CardDescription>{selectedTemplate.description || 'No description'}</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={handleLoadDefaults}>
                                            <LayoutTemplate className="h-4 w-4 mr-2" />Load Defaults
                                        </Button>
                                        <Dialog open={questionDialogOpen} onOpenChange={(o) => { setQuestionDialogOpen(o); if (!o) { setEditingQuestion(null); setQuestionForm({ questionText: '', questionType: 'RATING', isRequired: true }); } }}>
                                            <DialogTrigger asChild>
                                                <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Question</Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader><DialogTitle>{editingQuestion ? 'Edit' : 'Add'} Question</DialogTitle></DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid gap-2">
                                                        <Label>Question Text *</Label>
                                                        <Textarea value={questionForm.questionText} onChange={e => setQuestionForm({ ...questionForm, questionText: e.target.value })} />
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <Label>Type</Label>
                                                        <Select value={questionForm.questionType} onValueChange={(v: any) => setQuestionForm({ ...questionForm, questionType: v })}>
                                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="RATING">Rating (1-5)</SelectItem>
                                                                <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                                                                <SelectItem value="TEXT">Text</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Switch checked={questionForm.isRequired} onCheckedChange={v => setQuestionForm({ ...questionForm, isRequired: v })} />
                                                        <Label>Required</Label>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={handleAddQuestion} disabled={!questionForm.questionText}>{editingQuestion ? 'Update' : 'Add'}</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {questions.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm">No questions yet. Add questions or load defaults.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {questions.map((q, i) => (
                                            <div key={q.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-foreground/10 text-xs font-medium shrink-0 mt-0.5">{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm">{q.questionText}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-[10px]">{q.questionType}</Badge>
                                                        {q.isRequired && <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400">Required</Badge>}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                                                        setEditingQuestion(q.id);
                                                        setQuestionForm({ questionText: q.questionText, questionType: q.questionType, isRequired: q.isRequired });
                                                        setQuestionDialogOpen(true);
                                                    }}><Pencil className="h-3.5 w-3.5" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteQuestion(q.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-card/50">
                            <CardContent className="p-12 text-center text-muted-foreground">
                                <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Select a template to view and edit its questions.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
