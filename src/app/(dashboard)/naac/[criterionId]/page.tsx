'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import naacService, { NaacCriterion, NaacDocumentAnalysisResult, NaacGapAnalysisResult, NaacAnalysisResultUnion, NaacDraft } from '@/lib/services/naacService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle2, Circle, Clock, Upload, Brain, Loader2, FileText,
    Trash2, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert,
    RotateCcw, Award, BarChart3, Bookmark, Save, FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    COMPLIANT: { icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />, color: 'text-emerald-500', label: 'Compliant' },
    PARTIAL: { icon: <Clock className="h-5 w-5 text-amber-500" />, color: 'text-amber-500', label: 'Partial' },
    NON_COMPLIANT: { icon: <Circle className="h-5 w-5 text-red-400" />, color: 'text-red-400', label: 'Non-Compliant' },
    NOT_STARTED: { icon: <Circle className="h-5 w-5 text-muted-foreground" />, color: 'text-muted-foreground', label: 'Not Started' },
};

export default function NaacCriterionPage() {
    const params = useParams();
    const criterionId = params.criterionId as string;
    const [criterion, setCriterion] = useState<NaacCriterion | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<NaacAnalysisResultUnion | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [lastFormData, setLastFormData] = useState<FormData | null>(null);
    const [drafts, setDrafts] = useState<NaacDraft[]>([]);
    const [draftsOpen, setDraftsOpen] = useState(false);
    const [draftDialogOpen, setDraftDialogOpen] = useState(false);
    const [draftName, setDraftName] = useState('');
    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'redo' | 'draft' | 'confirm' | null>(null);
    const [savingBeforeAction, setSavingBeforeAction] = useState(false);

    const fetchCriterion = useCallback(async () => {
        try {
            const res = await naacService.getCriterionById(criterionId);
            const d = res.data as unknown as Record<string, unknown>;
            setCriterion((d.data as NaacCriterion) || (res.data as NaacCriterion));
        } catch { toast.error('Failed to load criterion'); } finally { setLoading(false); }
    }, [criterionId]);

    useEffect(() => { fetchCriterion(); }, [fetchCriterion]);

    const fetchDrafts = useCallback(async () => {
        try {
            const res = await naacService.getDrafts(criterionId);
            const d = res.data as unknown as Record<string, unknown>;
            setDrafts((d.data as NaacDraft[]) || (res.data as unknown as NaacDraft[]) || []);
        } catch { /* silently ignore */ }
    }, [criterionId]);

    useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

    const updateSubCriterion = async (id: string, updates: Record<string, unknown>) => {
        setSavingId(id);
        try {
            await naacService.updateSubCriterion(id, updates as any);
            toast.success('Saved successfully');
            fetchCriterion();
        } catch { toast.error('Update failed'); } finally { setSavingId(null); }
    };

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
        const files = fileInput?.files;
        if (!files || files.length === 0) return;

        if (files.length > 30) {
            toast.error('You can upload a maximum of 30 files at once.');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        setUploading(true);
        try {
            await naacService.uploadDocument(criterionId, formData);
            toast.success(`${files.length} document(s) uploaded`);
            setUploadOpen(false);
            fetchCriterion();
        } catch { toast.error('Upload failed'); } finally { setUploading(false); }
    };

    const handleDeleteDoc = async (docId: string) => {
        try {
            await naacService.deleteDocument(docId);
            toast.success('Document deleted');
            fetchCriterion();
        } catch { toast.error('Delete failed'); }
    };

    const analysisFileRef = React.useRef<HTMLInputElement>(null);

    const runAnalysis = async () => {
        setAnalyzing(true);
        setAnalysisResult(null);
        try {
            const res = await naacService.analyzeOnly(criterionId);
            const d = res.data as unknown as Record<string, unknown>;
            const result = (d.data as NaacGapAnalysisResult) || (res.data as unknown as NaacGapAnalysisResult);
            setAnalysisResult(result);
            toast.success('Analysis complete! Review the results below.');
        } catch { toast.error('Analysis failed'); } finally { setAnalyzing(false); }
    };

    const handleAnalysisFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
        setLastFormData(formData);

        setAnalyzing(true);
        setAnalysisResult(null);
        try {
            const res = await naacService.analyzeDocumentsOnly(formData);
            const d = res.data as unknown as Record<string, unknown>;
            const result = (d.data as NaacDocumentAnalysisResult) || (res.data as unknown as NaacDocumentAnalysisResult);
            setAnalysisResult(result);
            toast.success('Analysis complete! Review the results below.');
        } catch { toast.error('Document analysis failed'); } finally {
            setAnalyzing(false);
            if (analysisFileRef.current) analysisFileRef.current.value = '';
        }
    };

    const handleConfirmAnalysis = async () => {
        if (!analysisResult) return;
        setConfirming(true);
        try {
            await naacService.confirmAnalysis(analysisResult);
            toast.success('Analysis saved to AI Analysis Hub!');
            setAnalysisResult(null);
            setLastFormData(null);
            // Clear documents from this criterion
            for (const doc of documents) {
                try { await naacService.deleteDocument(doc.id); } catch { /* silently skip */ }
            }
            fetchCriterion();
        } catch { toast.error('Failed to save analysis'); } finally { setConfirming(false); }
    };

    const handleRedoAnalysis = () => {
        setAnalysisResult(null);
        runAnalysis();
    };

    // Open save confirmation dialog for any of the three buttons
    const openSaveConfirm = (action: 'redo' | 'draft' | 'confirm') => {
        setPendingAction(action);
        setSaveConfirmOpen(true);
    };

    // Proceed with the pending action (called after save dialog choice)
    const executePendingAction = (action: 'redo' | 'draft' | 'confirm') => {
        switch (action) {
            case 'redo':
                handleRedoAnalysis();
                break;
            case 'draft':
                setDraftDialogOpen(true);
                break;
            case 'confirm':
                // If user chose "Yes" the save already happened;
                // If "No", just clear the results and move on
                setAnalysisResult(null);
                setLastFormData(null);
                fetchCriterion();
                break;
        }
    };

    const handleSaveConfirmYes = async () => {
        if (!analysisResult || !pendingAction) return;
        setSavingBeforeAction(true);
        try {
            await naacService.confirmAnalysis(analysisResult);
            toast.success('Analysis saved to AI Analysis Hub!');
        } catch {
            toast.error('Failed to save analysis');
        } finally {
            setSavingBeforeAction(false);
        }
        const action = pendingAction;
        setSaveConfirmOpen(false);
        setPendingAction(null);
        // For 'confirm', the save is already done — just clear results
        if (action === 'confirm') {
            setAnalysisResult(null);
            setLastFormData(null);
            for (const doc of documents) {
                try { await naacService.deleteDocument(doc.id); } catch { /* skip */ }
            }
            fetchCriterion();
        } else {
            executePendingAction(action);
        }
    };

    const handleSaveConfirmNo = () => {
        const action = pendingAction;
        setSaveConfirmOpen(false);
        setPendingAction(null);
        if (action) executePendingAction(action);
    };

    const handleSaveToDraft = async () => {
        if (!draftName.trim() || !analysisResult) return;
        try {
            await naacService.createDraft({
                criterionId,
                name: draftName.trim(),
                documents: documents.map((doc: any) => ({
                    fileName: doc.fileName,
                    fileUrl: doc.fileUrl,
                    fileSize: doc.fileSize,
                    fileType: doc.fileType,
                })),
                analysisResult,
            });
            toast.success('Saved to drafts!');
            setDraftDialogOpen(false);
            setDraftName('');
            setAnalysisResult(null);
            setLastFormData(null);
            // Clear documents from criterion
            for (const doc of documents) {
                try { await naacService.deleteDocument(doc.id); } catch { /* skip */ }
            }
            fetchCriterion();
            fetchDrafts();
        } catch { toast.error('Failed to save draft'); }
    };

    const handleDeleteDraft = async (id: string) => {
        try {
            await naacService.deleteDraft(id);
            toast.success('Draft deleted');
            fetchDrafts();
        } catch { toast.error('Failed to delete draft'); }
    };

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;

    const subCriteria: any[] = criterion?.subCriteria || [];
    const documents: any[] = (criterion as any)?.documents || [];
    const compliantCount = subCriteria.filter(s => s.status === 'COMPLIANT').length;
    const partialCount = subCriteria.filter(s => s.status === 'PARTIAL').length;
    const progress = subCriteria.length > 0 ? ((compliantCount * 100 + partialCount * 50) / (subCriteria.length * 100)) * 100 : 0;

    // Evidence readiness: count sub-criteria that are Compliant/Partial AND have remarks or dataValue
    const withEvidence = subCriteria.filter(s =>
        (s.status === 'COMPLIANT' || s.status === 'PARTIAL') &&
        ((s.remarks && s.remarks.trim()) || (s.dataValue && s.dataValue.trim()))
    ).length;
    const needsEvidence = subCriteria.filter(s => s.status === 'COMPLIANT' || s.status === 'PARTIAL').length;
    const evidenceReady = needsEvidence > 0 ? Math.round((withEvidence / needsEvidence) * 100) : 100;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Badge className="mb-2">Criterion {criterion?.number || (criterion as any)?.criterionNumber}</Badge>
                    <h1 className="text-3xl font-bold">{criterion?.name || (criterion as any)?.title}</h1>
                    <p className="text-muted-foreground mt-1">{criterion?.description}</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Upload Documents</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Upload Supporting Documents</DialogTitle></DialogHeader>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Files (select up to 30)</Label>
                                    <Input type="file" name="files" multiple accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.csv,.pptx,.ppt,.jpg,.jpeg,.png" required />
                                    <p className="text-xs text-muted-foreground">You can select multiple files at once using Ctrl+Click or Shift+Click.</p>
                                </div>
                                <Button type="submit" disabled={uploading} className="w-full bg-foreground text-background hover:bg-foreground/90">
                                    {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : 'Upload'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <input
                        ref={analysisFileRef}
                        type="file"
                        multiple
                        accept=".pdf,.docx,.doc,.txt,.xlsx,.xls,.csv,.pptx,.ppt"
                        className="hidden"
                        onChange={handleAnalysisFiles}
                    />
                    <Button onClick={runAnalysis} disabled={analyzing} className="bg-foreground text-background hover:bg-foreground/90">
                        {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Brain className="mr-2 h-4 w-4" />Run AI Analysis</>}
                    </Button>
                </div>
            </div>

            {/* Drafts Section */}
            {drafts.length > 0 && (
                <Card className="border-border/50 border-dashed">
                    <CardContent className="p-4">
                        <button
                            onClick={() => setDraftsOpen(!draftsOpen)}
                            className="flex items-center justify-between w-full text-left"
                        >
                            <div className="flex items-center gap-2">
                                <Bookmark className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-semibold">Drafts</span>
                                <Badge variant="secondary" className="text-xs">{drafts.length}</Badge>
                            </div>
                            {draftsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        {draftsOpen && (
                            <div className="mt-3 space-y-2">
                                {drafts.map((draft) => (
                                    <div key={draft.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">{draft.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {draft.documents?.length || 0} document(s) · {new Date(draft.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                                                onClick={() => handleDeleteDraft(draft.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Progress */}
                <Card className="border-border/50">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Compliance Progress</span>
                            <span className="text-sm font-bold">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2.5" />
                        <p className="text-xs text-muted-foreground mt-2">{compliantCount} compliant, {partialCount} partial of {subCriteria.length}</p>
                    </CardContent>
                </Card>

                {/* Evidence Readiness */}
                <Card className={`border-border/50 ${evidenceReady < 100 ? 'border-amber-500/30' : 'border-emerald-500/30'}`}>
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {evidenceReady === 100
                                    ? <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                    : <ShieldAlert className="h-4 w-4 text-amber-500" />
                                }
                                <span className="text-sm font-medium">Evidence Readiness</span>
                            </div>
                            <span className={`text-sm font-bold ${evidenceReady === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>{evidenceReady}%</span>
                        </div>
                        <Progress value={evidenceReady} className="h-2.5" />
                        <p className="text-xs text-muted-foreground mt-2">{withEvidence} of {needsEvidence} items have supporting evidence</p>
                    </CardContent>
                </Card>

                {/* Documents */}
                <Card className="border-border/50">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium">Documents</span>
                            <span className="text-sm font-bold">{documents.length}</span>
                        </div>
                        <Progress value={documents.length > 0 ? 100 : 0} className="h-2.5" />
                        <p className="text-xs text-muted-foreground mt-2">{documents.length > 0 ? `${documents.length} file(s) uploaded` : 'No documents yet'}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Inline Analysis Results */}
            <AnimatePresence>
                {analysisResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        {/* Results Header with Actions */}
                        <Card className="border-emerald-500/30 bg-emerald-500/5">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                                            <Award className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground font-medium">Overall Score</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold text-emerald-500">
                                                    {'overallScore' in analysisResult ? analysisResult.overallScore : analysisResult.overallEstimatedScore}
                                                </span>
                                                <span className="text-lg text-muted-foreground">/ {'maxPossibleScore' in analysisResult ? analysisResult.maxPossibleScore : 5}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => openSaveConfirm('redo')}
                                            variant="outline"
                                            disabled={confirming || analyzing || savingBeforeAction}
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Redo Analysis
                                        </Button>
                                        <Button
                                            onClick={() => openSaveConfirm('draft')}
                                            variant="outline"
                                            disabled={confirming || savingBeforeAction}
                                            className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            Save to Draft
                                        </Button>
                                        <Button
                                            onClick={() => openSaveConfirm('confirm')}
                                            disabled={confirming || savingBeforeAction}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            {confirming ? (
                                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                                            ) : (
                                                <><CheckCircle2 className="mr-2 h-4 w-4" />Confirm & Save</>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary */}
                        {analysisResult.summary && (
                            <Card className="border-border/50">
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-3">
                                        <Brain className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                        <p className="text-sm leading-relaxed">{analysisResult.summary}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Criteria Score Breakdown — Gap Analysis */}
                        {'criteriaAnalysis' in analysisResult && analysisResult.criteriaAnalysis?.length > 0 && (
                            <Card className="border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <BarChart3 className="h-5 w-5 text-blue-500" />
                                        Criteria Analysis
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[...analysisResult.criteriaAnalysis]
                                        .sort((a, b) => a.criterionNumber - b.criterionNumber)
                                        .map((c) => {
                                            const p = c.maxScore > 0 ? Math.round((c.score / c.maxScore) * 100) : 0;
                                            return (
                                                <div key={c.criterionNumber} className="p-3 rounded-lg border border-border/50">
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="font-medium">
                                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-accent text-foreground text-xs font-bold mr-2">
                                                                {c.criterionNumber}
                                                            </span>
                                                            {c.title}
                                                        </span>
                                                        <span className={`font-semibold tabular-nums ${p >= 70 ? 'text-emerald-500' : p >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                                            {c.score} / {c.maxScore}
                                                        </span>
                                                    </div>
                                                    <Progress value={p} className={`h-2 rounded-full mb-2 ${p >= 70 ? '[&>div]:bg-emerald-500' : p >= 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'}`} />
                                                    <Badge variant="outline" className={`text-[10px] ${c.status === 'COMPLIANT' ? 'text-emerald-600 border-emerald-500/30' : c.status === 'PARTIAL' ? 'text-amber-600 border-amber-500/30' : 'text-red-500 border-red-500/30'}`}>
                                                        {c.status}
                                                    </Badge>
                                                    {c.gaps?.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-[10px] font-semibold uppercase text-red-500 mb-1">Gaps</p>
                                                            <ul className="space-y-0.5">
                                                                {c.gaps.map((g, i) => (
                                                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                                                        <span className="text-red-500">•</span>{g}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {c.recommendations?.length > 0 && (
                                                        <div className="mt-2">
                                                            <p className="text-[10px] font-semibold uppercase text-blue-500 mb-1">Recommendations</p>
                                                            <ul className="space-y-0.5">
                                                                {c.recommendations.map((r, i) => (
                                                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                                                        <span className="text-blue-500">•</span>{r}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </CardContent>
                            </Card>
                        )}

                        {/* Criteria Score Breakdown — Document Analysis */}
                        {'criteriaScores' in analysisResult && analysisResult.criteriaScores?.length > 0 && (
                            <Card className="border-border/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <BarChart3 className="h-5 w-5 text-blue-500" />
                                        Criteria Score Breakdown
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {[...analysisResult.criteriaScores]
                                        .sort((a, b) => a.criterionNumber - b.criterionNumber)
                                        .map((c) => {
                                            const p = c.maxMarks > 0 ? Math.round((c.estimatedMarks / c.maxMarks) * 100) : 0;
                                            return (
                                                <div key={c.criterionNumber} className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium">
                                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-accent text-foreground text-xs font-bold mr-2">
                                                                {c.criterionNumber}
                                                            </span>
                                                            {c.title}
                                                        </span>
                                                        <span className={`font-semibold tabular-nums ${p >= 70 ? 'text-emerald-500' : p >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                                            {c.estimatedMarks} / {c.maxMarks}
                                                        </span>
                                                    </div>
                                                    <Progress value={p} className={`h-2 rounded-full ${p >= 70 ? '[&>div]:bg-emerald-500' : p >= 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'}`} />
                                                </div>
                                            );
                                        })}
                                </CardContent>
                            </Card>
                        )}

                        {/* Sub-Criteria Quick View */}
                        {'subCriteriaScores' in analysisResult && analysisResult.subCriteriaScores && analysisResult.subCriteriaScores.length > 0 && (
                            <Card className="border-border/50">
                                <CardHeader>
                                    <CardTitle className="text-base">Sub-Criteria Scores</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {analysisResult.subCriteriaScores.map((sub: any) => {
                                        const p = sub.maxMarks > 0 ? Math.round((sub.estimatedMarks / sub.maxMarks) * 100) : 0;
                                        return (
                                            <div key={sub.subNumber} className="p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{sub.subNumber}</span>
                                                        <span className="text-sm font-medium">{sub.title}</span>
                                                        <Badge variant="outline" className={`text-[10px] ${sub.status === 'COMPLETE' ? 'text-emerald-600 border-emerald-500/30' : sub.status === 'PARTIAL' ? 'text-amber-600 border-amber-500/30' : 'text-red-500 border-red-500/30'}`}>
                                                            {sub.status}
                                                        </Badge>
                                                    </div>
                                                    <span className={`text-sm font-bold tabular-nums ${p >= 70 ? 'text-emerald-500' : p >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                                        {sub.estimatedMarks} / {sub.maxMarks}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{sub.justification}</p>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sub-Criteria List */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Sub-Criteria Checklist</span>
                        {needsEvidence > withEvidence && (
                            <Badge variant="outline" className="text-amber-500 border-amber-500/30 font-normal">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {needsEvidence - withEvidence} item{needsEvidence - withEvidence > 1 ? 's' : ''} missing evidence
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {subCriteria.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <Circle className="h-10 w-10 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">No sub-criteria found.</p>
                            <p className="text-xs text-muted-foreground">Go back to the NAAC overview page and click &quot;Initialize Sub-Criteria&quot;</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {subCriteria.map((sc: any) => {
                                const isExpanded = expandedId === sc.id;
                                const hasEvidence = (sc.remarks && sc.remarks.trim()) || (sc.dataValue && sc.dataValue.trim());
                                const isClaimedWithoutEvidence = (sc.status === 'COMPLIANT' || sc.status === 'PARTIAL') && !hasEvidence;
                                const statusConfig = STATUS_CONFIG[sc.status] || STATUS_CONFIG.NOT_STARTED;

                                return (
                                    <div key={sc.id} className={`rounded-lg border transition-all duration-200 ${isClaimedWithoutEvidence ? 'border-amber-500/40 bg-amber-500/5' : 'border-border/50 hover:bg-muted/30'}`}>
                                        {/* Main Row */}
                                        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : sc.id)}>
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                {statusConfig.icon}
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium truncate">{sc.subNumber || sc.number} — {sc.title || sc.name}</p>
                                                        {isClaimedWithoutEvidence && (
                                                            <span title="Missing evidence" className="flex-shrink-0">
                                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                            </span>
                                                        )}
                                                        {hasEvidence && (sc.status === 'COMPLIANT' || sc.status === 'PARTIAL') && (
                                                            <span title="Evidence provided" className="flex-shrink-0">
                                                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                                            </span>
                                                        )}
                                                    </div>
                                                    {sc.description && <p className="text-xs text-muted-foreground truncate">{sc.description}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 ml-4">
                                                <Select
                                                    defaultValue={sc.status}
                                                    onValueChange={(v) => {
                                                        // Prevent click from toggling expand
                                                        updateSubCriterion(sc.id, { status: v });
                                                    }}
                                                >
                                                    <SelectTrigger className="w-40" onClick={(e) => e.stopPropagation()}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                                                        <SelectItem value="PARTIAL">Partial</SelectItem>
                                                        <SelectItem value="COMPLIANT">Compliant</SelectItem>
                                                        <SelectItem value="NON_COMPLIANT">Non-Compliant</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {isExpanded
                                                    ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                    : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                }
                                            </div>
                                        </div>

                                        {/* Expanded Panel */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                                                        {isClaimedWithoutEvidence && (
                                                            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm">
                                                                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                                <span>This sub-criterion is marked as <strong>{statusConfig.label}</strong> but has no supporting evidence. Add remarks or data to justify compliance.</span>
                                                            </div>
                                                        )}

                                                        {/* Data Value Input */}
                                                        <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                                            <Label className="text-xs font-medium text-muted-foreground">Data / Metric Value</Label>
                                                            <Input
                                                                placeholder="e.g., Student-teacher ratio: 1:25, Placement rate: 85%"
                                                                defaultValue={sc.dataValue || ''}
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== (sc.dataValue || '')) {
                                                                        updateSubCriterion(sc.id, { dataValue: e.target.value });
                                                                    }
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Remarks / Notes */}
                                                        <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                                            <Label className="text-xs font-medium text-muted-foreground">Remarks / Justification</Label>
                                                            <Textarea
                                                                placeholder="Provide evidence description, justification, or notes about compliance..."
                                                                defaultValue={sc.remarks || ''}
                                                                rows={3}
                                                                className="resize-none"
                                                                onBlur={(e) => {
                                                                    if (e.target.value !== (sc.remarks || '')) {
                                                                        updateSubCriterion(sc.id, { remarks: e.target.value });
                                                                    }
                                                                }}
                                                            />
                                                        </div>

                                                        {savingId === sc.id && (
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                                Saving...
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Documents Section */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Supporting Documents
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {documents.length === 0 ? (
                        <div className="text-center py-10 space-y-3">
                            <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                            <p className="text-xs text-muted-foreground">Upload SSR reports, certificates, audit reports, or any supporting evidence.</p>
                            <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
                                <Upload className="mr-2 h-4 w-4" />Upload Document
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {documents.map((doc: any) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-foreground" />
                                        <div>
                                            <span className="text-sm font-medium">{doc.fileName || doc.name}</span>
                                            {doc.fileType && <span className="text-xs text-muted-foreground ml-2">({doc.fileType})</span>}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteDoc(doc.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Draft Name Dialog */}
            <Dialog open={draftDialogOpen} onOpenChange={setDraftDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save to Draft</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Draft Name</Label>
                            <Input
                                value={draftName}
                                onChange={(e) => setDraftName(e.target.value)}
                                placeholder="e.g. Criterion 1 - March 2026"
                                autoFocus
                            />
                        </div>
                        <Button
                            onClick={handleSaveToDraft}
                            disabled={!draftName.trim()}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            Save Draft
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Save Confirmation Dialog */}
            <Dialog open={saveConfirmOpen} onOpenChange={(open) => { if (!open && !savingBeforeAction) { setSaveConfirmOpen(false); setPendingAction(null); } }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save the result?</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground">Do you want to save the analysis results before proceeding?</p>
                    <div className="flex gap-3 justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={handleSaveConfirmNo}
                            disabled={savingBeforeAction}
                        >
                            No
                        </Button>
                        <Button
                            onClick={handleSaveConfirmYes}
                            disabled={savingBeforeAction}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {savingBeforeAction ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                            ) : (
                                'Yes'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
