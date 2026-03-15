'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import aiService from '@/lib/services/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Brain, FileBarChart, ArrowRight, Clock, Trash2, FileText, Award, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

interface AiReport {
    id: string;
    type: string;
    framework: string;
    status: string;
    summary?: string;
    createdAt: string;
    analysisType?: string;
    result?: any;
    inputData?: any;
}

export default function AiAnalysisPage() {
    const [reports, setReports] = useState<AiReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<AiReport | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchReports = useCallback(async () => {
        try {
            const res = await aiService.getReports();
            const d = res.data as unknown as Record<string, unknown>;
            setReports((d.data as AiReport[]) || (Array.isArray(d) ? d as AiReport[] : []));
        } catch { toast.error('Failed to load AI reports'); } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await aiService.deleteReport(deleteTarget.id);
            toast.success('Report deleted');
            setDeleteTarget(null);
            fetchReports();
        } catch { toast.error('Failed to delete report'); } finally { setDeleting(false); }
    };

    const getStatusColor = (s: string) => {
        switch (s) { case 'COMPLETED': return 'bg-emerald-500'; case 'PENDING': case 'IN_PROGRESS': case 'PROCESSING': return 'bg-amber-500'; case 'FAILED': return 'bg-red-500'; default: return 'bg-muted'; }
    };
    const getFrameworkColor = (f: string) => {
        switch (f) { case 'NAAC': return 'bg-blue-500/10 text-blue-600'; case 'NBA': return 'bg-accent/10 text-foreground'; case 'NIRF': return 'bg-amber-500/10 text-amber-600'; default: return 'bg-muted text-muted-foreground'; }
    };

    // Extract a human-readable scope label from inputData
    const getScopeLabel = (report: AiReport): string | null => {
        const inp = report.inputData as any;
        if (!inp) return null;
        if (inp.scope) return inp.scope;
        if (inp.subCriterionNumbers?.length) return `Sub-criteria: ${inp.subCriterionNumbers.join(', ')}`;
        if (inp.criterionNumber) return `Criterion ${inp.criterionNumber}`;
        return null;
    };

    // Extract overall score from result
    const getScore = (report: AiReport): string | null => {
        const r = report.result as any;
        if (!r) return null;
        const data = r.data || r;
        if (data?.overallEstimatedScore != null && data?.maxPossibleScore != null) {
            return `${data.overallEstimatedScore} / ${data.maxPossibleScore}`;
        }
        if (data?.overallScore != null) {
            return `${Number(data.overallScore).toFixed(1)} / 5.0`;
        }
        return null;
    };

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44" />)}</div></div>;

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn}>
                <h1 className="text-3xl font-bold">AI Analysis Hub</h1>
                <p className="text-muted-foreground mt-1">AI-powered gap analysis and recommendations</p>
            </motion.div>

            {reports.length === 0 ? (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50"><CardContent className="p-16 text-center">
                        <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No AI reports yet</h3>
                        <p className="text-sm text-muted-foreground">Run AI analysis from the NAAC page to generate gap analysis reports.</p>
                    </CardContent></Card>
                </motion.div>
            ) : (
                <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map(report => {
                        const scoreLabel = getScore(report);
                        const scopeLabel = getScopeLabel(report);
                        return (
                            <motion.div key={report.id} variants={fadeIn} className="relative group">
                                {/* Delete button — shown on hover, outside the Link */}
                                <button
                                    onClick={(e) => { e.preventDefault(); setDeleteTarget(report); }}
                                    className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete report"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>

                                <Link href={`/ai-analysis/${report.id}`} className="block h-full">
                                    <Card className="hover:shadow-lg hover:border-border transition-all duration-300 cursor-pointer border-border/50 h-full">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-2 pr-8">
                                                <Badge className={getFrameworkColor(report.framework)}>{report.framework}</Badge>
                                                <Badge className={`${getStatusColor(report.status)} text-white border-0`}>{report.status}</Badge>
                                            </div>
                                            <CardTitle className="text-lg mt-2">
                                                {report.analysisType?.replace(/_/g, ' ') || report.type?.replace(/_/g, ' ') || 'Gap Analysis'}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {/* Scope label */}
                                            {scopeLabel && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Tag className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate">{scopeLabel}</span>
                                                </div>
                                            )}

                                            {/* Score */}
                                            {scoreLabel && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Award className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">Score: {scoreLabel}</span>
                                                </div>
                                            )}

                                            {/* Summary */}
                                            {report.summary && (
                                                <p className="text-sm text-muted-foreground line-clamp-2">{report.summary}</p>
                                            )}

                                            {/* File count */}
                                            {(report.inputData as any)?.documentCount != null && (
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <FileText className="h-3.5 w-3.5 shrink-0" />
                                                    <span>{(report.inputData as any).documentCount} document(s) analysed</span>
                                                </div>
                                            )}

                                            {/* Date */}
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                                <span>{format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                                <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground group-hover:text-foreground transition-colors" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Analysis Report</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this report? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteTarget && (
                        <div className="p-3 rounded-lg bg-muted/40 text-sm">
                            <p className="font-medium">{deleteTarget.framework} — {deleteTarget.analysisType?.replace(/_/g, ' ') || 'Gap Analysis'}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(deleteTarget.createdAt), 'MMMM d, yyyy h:mm a')}
                            </p>
                        </div>
                    )}
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Deleting...' : 'Delete Report'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
