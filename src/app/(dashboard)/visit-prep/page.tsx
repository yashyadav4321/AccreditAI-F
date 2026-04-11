'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ListChecks, CheckCircle2, Circle, Plus, Trash2, HelpCircle, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { visitPrepService, ChecklistItem, MockQA, VisitProgress } from '@/lib/services/visitPrepService';

const CRITERIA_NAMES = ['General', 'Curricular Aspects', 'Teaching-Learning & Evaluation', 'Research & Extension', 'Infrastructure & Resources', 'Student Support & Progression', 'Governance & Leadership', 'Innovations & Best Practices'];

export default function VisitPrepPage() {
    const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
    const [mockqa, setMockqa] = useState<MockQA[]>([]);
    const [progress, setProgress] = useState<VisitProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [addItemOpen, setAddItemOpen] = useState(false);
    const [addQAOpen, setAddQAOpen] = useState(false);
    const [itemForm, setItemForm] = useState({ item: '', category: '', responsiblePerson: '', notes: '' });
    const [qaForm, setQaForm] = useState({ question: '', answer: '', criterionNumber: undefined as number | undefined });
    const [selectedCriterion, setSelectedCriterion] = useState<number | null>(null);

    const load = async () => {
        try {
            const [cl, qa, pr] = await Promise.all([
                visitPrepService.getChecklist(),
                visitPrepService.getMockQA(),
                visitPrepService.getProgress(),
            ]);
            setChecklist(cl.data.data || []);
            setMockqa(qa.data.data || []);
            setProgress(pr.data.data || null);
        } catch { /* empty for first load */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleInit = async (type: 'checklist' | 'mockqa') => {
        try {
            if (type === 'checklist') {
                await visitPrepService.initChecklist();
                toast.success('Checklist initialized with 28 default items');
            } else {
                await visitPrepService.initMockQA();
                toast.success('Mock Q&A initialized with 34 questions');
            }
            load();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to initialize'); }
    };

    const toggleItem = async (item: ChecklistItem) => {
        try {
            await visitPrepService.updateChecklistItem(item.id, { isCompleted: !item.isCompleted });
            load();
        } catch { toast.error('Failed to update'); }
    };

    const handleAddItem = async () => {
        try {
            await visitPrepService.addChecklistItem(itemForm);
            toast.success('Item added');
            setAddItemOpen(false);
            setItemForm({ item: '', category: '', responsiblePerson: '', notes: '' });
            load();
        } catch { toast.error('Failed to add'); }
    };

    const handleDeleteItem = async (id: string) => {
        try {
            await visitPrepService.deleteChecklistItem(id);
            toast.success('Item deleted');
            load();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to delete'); }
    };

    const handleAddQA = async () => {
        try {
            await visitPrepService.addMockQA(qaForm);
            toast.success('Q&A added');
            setAddQAOpen(false);
            setQaForm({ question: '', answer: '', criterionNumber: undefined });
            load();
        } catch { toast.error('Failed to add'); }
    };

    const handleSaveAnswer = async (qa: MockQA, answer: string) => {
        try {
            await visitPrepService.updateMockQA(qa.id, { answer });
            load();
        } catch { toast.error('Failed to save'); }
    };

    const categories = [...new Set(checklist.map(c => c.category).filter(Boolean))];
    const filteredQA = selectedCriterion !== null
        ? mockqa.filter(q => (selectedCriterion === 0 ? q.criterionNumber === null : q.criterionNumber === selectedCriterion))
        : mockqa;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Peer Team Visit Preparation</h1>
                        <p className="text-muted-foreground mt-1">Checklist and mock Q&A for NAAC peer team visits</p>
                    </div>
                </div>
            </motion.div>

            {/* Progress Overview */}
            {progress && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="bg-card/50 backdrop-blur">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                                    <span className="text-2xl font-bold">{progress.overallPercent}%</span>
                                </div>
                                <Progress value={progress.overallPercent} className="h-2" />
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 backdrop-blur">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-muted-foreground">Checklist</p>
                                    <span className="text-sm font-medium">{progress.checklist.completed}/{progress.checklist.total}</span>
                                </div>
                                <Progress value={progress.checklist.percent} className="h-2" />
                            </CardContent>
                        </Card>
                        <Card className="bg-card/50 backdrop-blur">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-muted-foreground">Mock Q&A</p>
                                    <span className="text-sm font-medium">{progress.mockQA.answered}/{progress.mockQA.total}</span>
                                </div>
                                <Progress value={progress.mockQA.percent} className="h-2" />
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            )}

            <Tabs defaultValue="checklist">
                <TabsList>
                    <TabsTrigger value="checklist"><ListChecks className="h-4 w-4 mr-2" />Checklist</TabsTrigger>
                    <TabsTrigger value="mockqa"><HelpCircle className="h-4 w-4 mr-2" />Mock Q&A</TabsTrigger>
                </TabsList>

                <TabsContent value="checklist" className="mt-4 space-y-4">
                    {checklist.length === 0 ? (
                        <Card className="bg-card/50"><CardContent className="p-12 text-center">
                            <ListChecks className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground mb-4">No checklist items yet.</p>
                            <Button onClick={() => handleInit('checklist')}>Initialize Default Checklist</Button>
                        </CardContent></Card>
                    ) : (
                        <>
                            <div className="flex justify-end">
                                <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
                                    <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Item</Button></DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Add Checklist Item</DialogTitle></DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2"><Label>Item *</Label><Input value={itemForm.item} onChange={e => setItemForm({ ...itemForm, item: e.target.value })} /></div>
                                            <div className="grid gap-2"><Label>Category</Label><Input value={itemForm.category} onChange={e => setItemForm({ ...itemForm, category: e.target.value })} /></div>
                                            <div className="grid gap-2"><Label>Responsible Person</Label><Input value={itemForm.responsiblePerson} onChange={e => setItemForm({ ...itemForm, responsiblePerson: e.target.value })} /></div>
                                        </div>
                                        <DialogFooter><Button onClick={handleAddItem} disabled={!itemForm.item}>Add</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            {categories.map(cat => (
                                <Card key={cat}>
                                    <CardHeader className="pb-3"><CardTitle className="text-base">{cat}</CardTitle></CardHeader>
                                    <CardContent className="space-y-1">
                                        {checklist.filter(c => c.category === cat).map(item => (
                                            <div key={item.id} className="flex items-center gap-3 py-2 px-3 rounded hover:bg-muted/30 transition-colors group">
                                                <button onClick={() => toggleItem(item)} className="shrink-0">
                                                    {item.isCompleted
                                                        ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                                        : <Circle className="h-5 w-5 text-muted-foreground" />}
                                                </button>
                                                <span className={`text-sm flex-1 ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}>{item.item}</span>
                                                {item.responsiblePerson && <Badge variant="outline" className="text-[10px]">{item.responsiblePerson}</Badge>}
                                                {item.isCustom && (
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteItem(item.id)}>
                                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    )}
                </TabsContent>

                <TabsContent value="mockqa" className="mt-4 space-y-4">
                    {mockqa.length === 0 ? (
                        <Card className="bg-card/50"><CardContent className="p-12 text-center">
                            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground mb-4">No mock Q&A yet.</p>
                            <Button onClick={() => handleInit('mockqa')}>Initialize Default Questions</Button>
                        </CardContent></Card>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-wrap gap-2">
                                    <Button variant={selectedCriterion === null ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCriterion(null)}>All</Button>
                                    {[0, 1, 2, 3, 4, 5, 6, 7].map(n => (
                                        <Button key={n} variant={selectedCriterion === n ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCriterion(n)}>
                                            {n === 0 ? 'General' : `C${n}`}
                                        </Button>
                                    ))}
                                </div>
                                <Dialog open={addQAOpen} onOpenChange={setAddQAOpen}>
                                    <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Q&A</Button></DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader><DialogTitle>Add Mock Question</DialogTitle></DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2"><Label>Question *</Label><Textarea value={qaForm.question} onChange={e => setQaForm({ ...qaForm, question: e.target.value })} /></div>
                                            <div className="grid gap-2"><Label>Suggested Answer</Label><Textarea value={qaForm.answer} onChange={e => setQaForm({ ...qaForm, answer: e.target.value })} /></div>
                                            <div className="grid gap-2"><Label>Criterion</Label>
                                                <Select value={qaForm.criterionNumber?.toString() || ''} onValueChange={v => setQaForm({ ...qaForm, criterionNumber: v ? parseInt(v) : undefined })}>
                                                    <SelectTrigger><SelectValue placeholder="Select criterion" /></SelectTrigger>
                                                    <SelectContent>{[1, 2, 3, 4, 5, 6, 7].map(n => <SelectItem key={n} value={n.toString()}>Criterion {n}</SelectItem>)}</SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter><Button onClick={handleAddQA} disabled={!qaForm.question}>Add</Button></DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <div className="space-y-3">
                                {filteredQA.map((qa, i) => (
                                    <Card key={qa.id} className={`transition-all ${qa.isAnswered ? 'border-l-2 border-l-emerald-500' : 'border-l-2 border-l-amber-500'}`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-foreground/10 text-xs font-medium shrink-0 mt-0.5">
                                                    {qa.criterionNumber ? `C${qa.criterionNumber}` : 'G'}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{qa.question}</p>
                                                    <div className="mt-2">
                                                        <Textarea
                                                            defaultValue={qa.answer || ''}
                                                            placeholder="Type your prepared answer here..."
                                                            rows={3}
                                                            className="text-sm"
                                                            onBlur={e => {
                                                                if (e.target.value !== (qa.answer || '')) {
                                                                    handleSaveAnswer(qa, e.target.value);
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {qa.isAnswered && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-1" />}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
