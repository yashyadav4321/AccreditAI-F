'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import aiService from '@/lib/services/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    Brain, AlertTriangle, CheckCircle2, TrendingUp, FileText,
    ChevronDown, ChevronRight, BookOpen, Shield, CircleDot,
    Award, BarChart3, Info, Lightbulb,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface SubCriterionScore {
    subNumber: string;
    title: string;
    estimatedMarks: number;
    maxMarks: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'COMPLETE' | 'PARTIAL' | 'INCOMPLETE';
    justification: string;
    checklistItems: string[];
    recommendations?: string[];
}

interface CriterionScore {
    criterionNumber: number;
    title: string;
    estimatedMarks: number;
    maxMarks: number;
}

interface DocumentAnalysisResult {
    summary: string;
    overallEstimatedScore: number;
    maxPossibleScore: number;
    checklistUsed: string;
    criteriaScores: CriterionScore[];
    subCriteriaScores: SubCriterionScore[];
    recommendations?: string[];
}

interface AiReport {
    id: string;
    type: string;
    framework: string;
    status: string;
    summary?: string;
    result?: DocumentAnalysisResult;
    gaps?: { area: string; severity: string; description: string; recommendation: string }[];
    recommendations?: string[];
    score?: number;
    createdAt: string;
    rawResponse?: string;
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const statusConfig = {
    COMPLETE: { label: 'Complete', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30', icon: CheckCircle2 },
    PARTIAL: { label: 'Partial', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30', icon: AlertTriangle },
    INCOMPLETE: { label: 'Incomplete', color: 'bg-red-500/15 text-red-500 border-red-500/30', icon: CircleDot },
};

const confidenceConfig = {
    HIGH: { label: 'High Confidence', color: 'bg-emerald-500/10 text-emerald-600' },
    MEDIUM: { label: 'Medium Confidence', color: 'bg-amber-500/10 text-amber-600' },
    LOW: { label: 'Low Confidence', color: 'bg-red-500/10 text-red-500' },
};

function pct(val: number, max: number) {
    return max > 0 ? Math.round((val / max) * 100) : 0;
}

function scoreColor(percentage: number) {
    if (percentage >= 70) return 'text-emerald-500';
    if (percentage >= 40) return 'text-amber-500';
    return 'text-red-500';
}

function progressColor(percentage: number) {
    if (percentage >= 70) return '[&>div]:bg-emerald-500';
    if (percentage >= 40) return '[&>div]:bg-amber-500';
    return '[&>div]:bg-red-500';
}

/* ─── Sub-Components ────────────────────────────────────────────────────── */

function OverallScoreCard({ result }: { result: DocumentAnalysisResult }) {
    const percentage = pct(result.overallEstimatedScore, result.maxPossibleScore);
    return (
        <motion.div variants={fadeIn}>
            <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <Award className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Overall Estimated Score</p>
                                <div className="flex items-baseline gap-1">
                                    <span className={cn('text-3xl font-bold', scoreColor(percentage))}>
                                        {result.overallEstimatedScore}
                                    </span>
                                    <span className="text-lg text-muted-foreground">/ {result.maxPossibleScore}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className={cn('text-4xl font-bold', scoreColor(percentage))}>{percentage}%</p>
                        </div>
                    </div>
                    <Progress value={percentage} className={cn('h-3 rounded-full', progressColor(percentage))} />
                </CardContent>
            </Card>
        </motion.div>
    );
}

function CriteriaScoresTable({ criteria }: { criteria: CriterionScore[] }) {
    const sorted = [...criteria].sort((a, b) => a.criterionNumber - b.criterionNumber);
    return (
        <motion.div variants={fadeIn}>
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        Criteria-wise Score Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sorted.map((c) => {
                            const p = pct(c.estimatedMarks, c.maxMarks);
                            return (
                                <div key={c.criterionNumber} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">
                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-md bg-accent text-foreground text-xs font-bold mr-2">
                                                {c.criterionNumber}
                                            </span>
                                            {c.title}
                                        </span>
                                        <span className={cn('font-semibold tabular-nums', scoreColor(p))}>
                                            {c.estimatedMarks} / {c.maxMarks}
                                        </span>
                                    </div>
                                    <Progress value={p} className={cn('h-2 rounded-full', progressColor(p))} />
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function SubCriterionCard({ sub }: { sub: SubCriterionScore }) {
    const p = pct(sub.estimatedMarks, sub.maxMarks);
    const statusCfg = statusConfig[sub.status] || statusConfig.INCOMPLETE;
    const confCfg = confidenceConfig[sub.confidence] || confidenceConfig.LOW;
    const StatusIcon = statusCfg.icon;

    return (
        <div className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/30 transition-colors">
            {/* Header row */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {sub.subNumber}
                        </span>
                        <Badge variant="outline" className={cn('text-[10px] border', statusCfg.color)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusCfg.label}
                        </Badge>
                        <Badge variant="outline" className={cn('text-[10px]', confCfg.color)}>
                            {confCfg.label}
                        </Badge>
                    </div>
                    <h4 className="text-sm font-medium leading-snug">{sub.title}</h4>
                </div>
                <div className="text-right shrink-0">
                    <p className={cn('text-lg font-bold tabular-nums', scoreColor(p))}>
                        {sub.estimatedMarks}<span className="text-xs text-muted-foreground font-normal"> / {sub.maxMarks}</span>
                    </p>
                </div>
            </div>

            {/* Progress bar */}
            <Progress value={p} className={cn('h-1.5 rounded-full mb-3', progressColor(p))} />

            {/* Justification */}
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">{sub.justification}</p>

            {/* Checklist Items */}
            {sub.checklistItems && sub.checklistItems.length > 0 && (
                <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                        <Shield className="h-3 w-3" /> Checklist Points Evaluated
                    </p>
                    <ul className="space-y-1.5">
                        {sub.checklistItems.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Recommendations: only for COMPLETE sub-criteria with remaining marks */}
            {sub.status === 'COMPLETE' &&
                sub.estimatedMarks < sub.maxMarks &&
                sub.recommendations && sub.recommendations.length > 0 && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 mb-2 flex items-center gap-1.5">
                        <Lightbulb className="h-3 w-3" />
                        To earn remaining {sub.maxMarks - sub.estimatedMarks} marks
                    </p>
                    <ol className="space-y-2 list-none">
                        {sub.recommendations.map((rec, ri) => (
                            <li key={ri} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                                <span className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                    {ri + 1}
                                </span>
                                {rec}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}

function CriterionSection({
    criterion,
    subCriteria,
}: {
    criterion: CriterionScore;
    subCriteria: SubCriterionScore[];
}) {
    const [expanded, setExpanded] = useState(false);
    const p = pct(criterion.estimatedMarks, criterion.maxMarks);

    const complete = subCriteria.filter((s) => s.status === 'COMPLETE').length;
    const partial = subCriteria.filter((s) => s.status === 'PARTIAL').length;
    const incomplete = subCriteria.filter((s) => s.status === 'INCOMPLETE').length;

    return (
        <motion.div variants={fadeIn}>
            <Card className="border-border/50 overflow-hidden">
                {/* Clickable header */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full text-left p-5 flex items-center justify-between hover:bg-accent/30 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            'h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold',
                            p >= 70 ? 'bg-emerald-500' : p >= 40 ? 'bg-amber-500' : 'bg-red-500',
                        )}>
                            {criterion.criterionNumber}
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">{criterion.title}</h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span className="text-emerald-500">{complete} complete</span>
                                <span className="text-amber-500">{partial} partial</span>
                                <span className="text-red-500">{incomplete} incomplete</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={cn('text-lg font-bold tabular-nums', scoreColor(p))}>
                            {criterion.estimatedMarks} / {criterion.maxMarks}
                        </span>
                        {expanded
                            ? <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            : <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                    </div>
                </button>

                {/* Expandable body */}
                <AnimatePresence initial={false}>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                        >
                            <div className="px-5 pb-5 space-y-3 border-t border-border/50 pt-4">
                                {subCriteria.map((sub) => (
                                    <SubCriterionCard key={sub.subNumber} sub={sub} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}

function ChecklistSourceCard({ source }: { source: string }) {
    return (
        <motion.div variants={fadeIn}>
            <Card className="border-border/50 bg-blue-500/5">
                <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                Checklist & Evaluation Source
                            </p>
                            <p className="text-sm font-medium">{source}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                All estimated marks, completion statuses, and checklist evaluations are based on this framework.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */

export default function AiReportDetailPage() {
    const params = useParams();
    const reportId = params.reportId as string;
    const [report, setReport] = useState<AiReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await aiService.getReportById(reportId);
                const d = res.data as unknown as Record<string, unknown>;
                setReport((d.data as AiReport) || d as unknown as AiReport);
            } catch { toast.error('Failed to load report'); } finally { setLoading(false); }
        };
        fetchReport();
    }, [reportId]);

    if (loading) return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-40" />
            <Skeleton className="h-80" />
        </div>
    );
    if (!report) return <p className="text-center text-muted-foreground py-16">Report not found.</p>;

    const severityColor = (s: string) => {
        switch (s.toUpperCase()) { case 'HIGH': case 'CRITICAL': return 'text-red-500'; case 'MEDIUM': return 'text-amber-500'; default: return 'text-blue-500'; }
    };

    // Extract document analysis result data — check multiple possible locations
    const rawResult = report.result as any;
    const result: DocumentAnalysisResult | null =
        (rawResult?.criteriaScores && rawResult?.subCriteriaScores) ? rawResult :
            (rawResult?.data?.criteriaScores && rawResult?.data?.subCriteriaScores) ? rawResult.data :
                null;

    const hasDocAnalysis = !!result;

    // Group sub-criteria by criterion number
    const subByCriterion: Record<number, SubCriterionScore[]> = {};
    if (hasDocAnalysis) {
        for (const sub of result.subCriteriaScores) {
            const cNum = parseInt(sub.subNumber.split('.')[0], 10);
            if (!subByCriterion[cNum]) subByCriterion[cNum] = [];
            subByCriterion[cNum].push(sub);
        }
    }

    // Top-level stats for document analysis
    const totalComplete = hasDocAnalysis ? result.subCriteriaScores.filter(s => s.status === 'COMPLETE').length : 0;
    const totalPartial = hasDocAnalysis ? result.subCriteriaScores.filter(s => s.status === 'PARTIAL').length : 0;
    const totalIncomplete = hasDocAnalysis ? result.subCriteriaScores.filter(s => s.status === 'INCOMPLETE').length : 0;

    // Also handle gap analysis result (from analyzeNaac)
    const gapResult = rawResult as any;
    const hasGapAnalysis = !hasDocAnalysis && gapResult?.criteriaAnalysis && Array.isArray(gapResult.criteriaAnalysis);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-5xl">
            {/* Header */}
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{report.framework}</Badge>
                        <Badge className={`${report.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'} text-white border-0`}>{report.status}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold">{report.type?.replace(/_/g, ' ') || 'AI Analysis Report'}</h1>
                    <p className="text-muted-foreground mt-1">Generated on {format(new Date(report.createdAt), 'MMMM d, yyyy h:mm a')}</p>
                </div>
            </motion.div>

            {/* ──── Document Analysis (new sections) ──── */}
            {hasDocAnalysis && (
                <>
                    {/* Overall Score */}
                    <OverallScoreCard result={result} />

                    {/* Quick status summary */}
                    <motion.div variants={fadeIn} className="grid grid-cols-3 gap-4">
                        <Card className="border-border/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-emerald-500">{totalComplete}</p>
                                    <p className="text-xs text-muted-foreground">Complete</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="border-border/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-amber-500">{totalPartial}</p>
                                    <p className="text-xs text-muted-foreground">Partial</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="border-border/50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-red-500/15 flex items-center justify-center">
                                    <CircleDot className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-red-500">{totalIncomplete}</p>
                                    <p className="text-xs text-muted-foreground">Incomplete</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Criteria Scores Table */}
                    <CriteriaScoresTable criteria={result.criteriaScores} />

                    {/* Per-Criterion Expandable Sections */}
                    <motion.div variants={fadeIn}>
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="h-5 w-5 text-muted-foreground" />
                            <h2 className="text-xl font-semibold">Sub-Criteria Details</h2>
                            <p className="text-xs text-muted-foreground ml-2">Click a criterion to expand its sub-criteria</p>
                        </div>
                    </motion.div>

                    {result.criteriaScores
                        .sort((a, b) => a.criterionNumber - b.criterionNumber)
                        .map((criterion) => (
                            <CriterionSection
                                key={criterion.criterionNumber}
                                criterion={criterion}
                                subCriteria={subByCriterion[criterion.criterionNumber] || []}
                            />
                        ))}

                    {/* Checklist Source */}
                    {result.checklistUsed && (
                        <ChecklistSourceCard source={result.checklistUsed} />
                    )}
                </>
            )}

            {/* ──── Gap Analysis (from analyzeNaac) ──── */}
            {hasGapAnalysis && (
                <>
                    {/* Overall Score */}
                    <motion.div variants={fadeIn}>
                        <Card className="border-border/50 overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                            <Award className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground font-medium">Overall Score</p>
                                            <span className={cn('text-3xl font-bold', scoreColor(pct(gapResult.overallScore, 5)))}>
                                                {gapResult.overallScore?.toFixed(1)}
                                            </span>
                                            <span className="text-lg text-muted-foreground"> / 5.0</span>
                                        </div>
                                    </div>
                                    <p className={cn('text-4xl font-bold', scoreColor(pct(gapResult.overallScore, 5)))}>
                                        {pct(gapResult.overallScore, 5)}%
                                    </p>
                                </div>
                                <Progress value={pct(gapResult.overallScore, 5)} className={cn('h-3 rounded-full', progressColor(pct(gapResult.overallScore, 5)))} />
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Criteria Breakdown */}
                    <motion.div variants={fadeIn}>
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="h-5 w-5 text-blue-500" />
                            <h2 className="text-xl font-semibold">Criteria Analysis</h2>
                        </div>
                    </motion.div>

                    {gapResult.criteriaAnalysis
                        .sort((a: any, b: any) => a.criterionNumber - b.criterionNumber)
                        .map((ca: any) => {
                            const p = pct(ca.score, ca.maxScore || 5);
                            const gapStatusConfig = {
                                COMPLIANT: { label: 'Compliant', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
                                PARTIAL: { label: 'Partial', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
                                NON_COMPLIANT: { label: 'Non-Compliant', color: 'bg-red-500/15 text-red-500 border-red-500/30' },
                                NOT_STARTED: { label: 'Not Started', color: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/30' },
                            };
                            const sCfg = gapStatusConfig[ca.status as keyof typeof gapStatusConfig] || gapStatusConfig.NOT_STARTED;

                            return (
                                <motion.div key={ca.criterionNumber} variants={fadeIn}>
                                    <Card className="border-border/50 mb-4">
                                        <CardContent className="p-5">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        'h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold',
                                                        p >= 70 ? 'bg-emerald-500' : p >= 40 ? 'bg-amber-500' : 'bg-red-500',
                                                    )}>
                                                        {ca.criterionNumber}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-sm">{ca.title}</h3>
                                                        <Badge variant="outline" className={cn('text-[10px] border mt-1', sCfg.color)}>{sCfg.label}</Badge>
                                                    </div>
                                                </div>
                                                <span className={cn('text-lg font-bold tabular-nums', scoreColor(p))}>
                                                    {ca.score?.toFixed(1)} / {ca.maxScore?.toFixed(1) || '5.0'}
                                                </span>
                                            </div>

                                            <Progress value={p} className={cn('h-2 rounded-full mb-4', progressColor(p))} />

                                            {/* Strengths */}
                                            {ca.strengths?.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500 mb-1.5 flex items-center gap-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Strengths
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {ca.strengths.map((s: string, i: number) => (
                                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                                                <span className="text-emerald-500 mt-0.5">•</span>{s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Weaknesses */}
                                            {ca.weaknesses?.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 mb-1.5 flex items-center gap-1">
                                                        <AlertTriangle className="h-3 w-3" /> Weaknesses
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {ca.weaknesses.map((w: string, i: number) => (
                                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                                                <span className="text-amber-500 mt-0.5">•</span>{w}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Gaps */}
                                            {ca.gaps?.length > 0 && (
                                                <div className="mb-3">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-red-500 mb-1.5 flex items-center gap-1">
                                                        <CircleDot className="h-3 w-3" /> Gaps
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {ca.gaps.map((g: string, i: number) => (
                                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                                                <span className="text-red-500 mt-0.5">•</span>{g}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Per-criterion Recommendations */}
                                            {ca.recommendations?.length > 0 && (
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500 mb-1.5 flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" /> Recommendations
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {ca.recommendations.map((r: string, i: number) => (
                                                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                                                <span className="text-blue-500 mt-0.5">•</span>{r}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                </>
            )}

            {/* ──── Legacy sections (Summary, Gaps, Recommendations) ──── */}

            {/* Summary */}
            {(report.summary || result?.summary || gapResult?.summary) && (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />Summary</CardTitle></CardHeader>
                        <CardContent><p className="text-sm leading-relaxed">{result?.summary || gapResult?.summary || report.summary}</p></CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Gaps */}
            {report.gaps && report.gaps.length > 0 && (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" />Identified Gaps</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {report.gaps.map((gap, i) => (
                                <div key={i} className="p-4 rounded-lg border border-border/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{gap.area}</h4>
                                        <Badge variant="outline" className={severityColor(gap.severity)}>{gap.severity}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{gap.description}</p>
                                    <Separator className="my-2" />
                                    <div className="flex items-start gap-2">
                                        <TrendingUp className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-emerald-600 dark:text-emerald-400">{gap.recommendation}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Recommendations */}
            {((report.recommendations && report.recommendations.length > 0) || (result?.recommendations && result.recommendations.length > 0)) && (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" />Recommendations</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {(result?.recommendations || report.recommendations || []).map((r, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <span className="h-6 w-6 rounded-full bg-accent text-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                        <span>{r}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Raw Response Fallback */}
            {!report.gaps && !report.recommendations && !hasDocAnalysis && report.rawResponse && (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-muted-foreground" />Raw Response</CardTitle></CardHeader>
                        <CardContent><pre className="text-xs bg-muted/30 p-4 rounded-lg whitespace-pre-wrap overflow-x-auto">{report.rawResponse}</pre></CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}
