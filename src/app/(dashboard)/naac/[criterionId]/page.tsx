'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import naacService, { NaacCriterion } from '@/lib/services/naacService';
import aiService from '@/lib/services/aiService';
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
    Trash2, AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert
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

    const fetchCriterion = useCallback(async () => {
        try {
            const res = await naacService.getCriterionById(criterionId);
            const d = res.data as unknown as Record<string, unknown>;
            setCriterion((d.data as NaacCriterion) || (res.data as NaacCriterion));
        } catch { toast.error('Failed to load criterion'); } finally { setLoading(false); }
    }, [criterionId]);

    useEffect(() => { fetchCriterion(); }, [fetchCriterion]);

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
        const formData = new FormData(form);
        setUploading(true);
        try {
            await naacService.uploadDocument(criterionId, formData);
            toast.success('Document uploaded');
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

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            await aiService.analyzeNaac({ criterionId });
            toast.success('AI analysis started! Check AI Analysis page for results.');
        } catch { toast.error('Analysis failed'); } finally { setAnalyzing(false); }
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
                            <Button variant="outline"><Upload className="mr-2 h-4 w-4" />Upload Document</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Upload Supporting Document</DialogTitle></DialogHeader>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>File</Label>
                                    <Input type="file" name="file" required />
                                </div>
                                <Button type="submit" disabled={uploading} className="w-full bg-foreground text-background hover:bg-foreground/90">
                                    {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : 'Upload'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={runAnalysis} disabled={analyzing} className="bg-foreground text-background hover:bg-foreground/90">
                        {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Brain className="mr-2 h-4 w-4" />Run AI Analysis</>}
                    </Button>
                </div>
            </div>

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
        </motion.div>
    );
}
