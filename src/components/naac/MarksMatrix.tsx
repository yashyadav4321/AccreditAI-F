import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Brain, CheckCircle2, AlertCircle, HelpCircle, TrendingUp,
    FileCheck, BarChart3, ChevronDown, ChevronUp,
    ShieldCheck, XCircle, Clock, Lightbulb,
} from 'lucide-react';
import { NaacDocumentAnalysisResult, NaacSubCriterionScore } from '@/lib/services/naacService';


interface MarksMatrixProps {
    result: NaacDocumentAnalysisResult;
}

const CONFIDENCE_CONFIG = {
    HIGH: { icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />, color: 'text-emerald-500', label: 'High' },
    MEDIUM: { icon: <AlertCircle className="h-3.5 w-3.5 text-amber-500" />, color: 'text-amber-500', label: 'Med' },
    LOW: { icon: <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />, color: 'text-muted-foreground', label: 'Low' },
};

const STATUS_CONFIG = {
    COMPLETE: { icon: <ShieldCheck className="h-3.5 w-3.5" />, color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'Complete' },
    PARTIAL: { icon: <Clock className="h-3.5 w-3.5" />, color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', label: 'Partial' },
    INCOMPLETE: { icon: <XCircle className="h-3.5 w-3.5" />, color: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'Incomplete' },
};

function ScoreBar({ score, max }: { score: number; max: number }) {
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={`text-xs font-bold tabular-nums shrink-0 ${pct >= 70 ? 'text-emerald-500' : pct >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                {score}/{max}
            </span>
        </div>
    );
}

export function MarksMatrix({ result }: MarksMatrixProps) {
    const overallPct = result.maxPossibleScore > 0
        ? Math.round((result.overallEstimatedScore / result.maxPossibleScore) * 100)
        : 0;
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

    const completeCount = result.subCriteriaScores.filter(s => s.status === 'COMPLETE').length;
    const partialCount = result.subCriteriaScores.filter(s => s.status === 'PARTIAL').length;
    const incompleteCount = result.subCriteriaScores.filter(s => s.status === 'INCOMPLETE').length;

    const overallColor = overallPct >= 70 ? 'text-emerald-400' : overallPct >= 40 ? 'text-amber-400' : 'text-red-400';
    const barColor = overallPct >= 70 ? '[&>div]:bg-emerald-500' : overallPct >= 40 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500';

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-2">

            {/* ── Hero Score Card ── */}
            <Card className="border-border/50 overflow-hidden">
                <div className="p-5">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shrink-0">
                                <Brain className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm">AI Analysis Results</p>
                                <p className="text-xs text-muted-foreground">{result.subCriteriaScores.length} sub-criteria evaluated</p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className={`text-3xl font-bold tabular-nums ${overallColor}`}>
                                {result.overallEstimatedScore.toFixed(0)}
                                <span className="text-base text-muted-foreground font-normal">/{result.maxPossibleScore}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{overallPct}% compliance</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <Progress value={overallPct} className={`h-2.5 rounded-full mb-4 ${barColor}`} />

                    {/* Stat pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {completeCount} Complete
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            {partialCount} Partial
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            {incompleteCount} Incomplete
                        </div>
                        {result.processingTime && (
                            <div className="ml-auto text-xs text-muted-foreground tabular-nums">
                                {(result.processingTime / 1000).toFixed(1)}s
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {result.summary && (
                        <p className="text-sm text-muted-foreground leading-relaxed mt-4 pt-4 border-t border-border/50">
                            {result.summary}
                        </p>
                    )}
                </div>
            </Card>

            {/* ── Sub-criteria rows ── */}
            <Card className="border-border/50 overflow-hidden">
                <CardHeader className="pb-3 px-5 pt-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        Detailed Marks
                    </CardTitle>
                </CardHeader>
                <div className="divide-y divide-border/50">
                    {result.subCriteriaScores.map((score: NaacSubCriterionScore, idx: number) => {
                        const conf = CONFIDENCE_CONFIG[score.confidence] ?? CONFIDENCE_CONFIG.LOW;
                        const stat = STATUS_CONFIG[score.status] ?? STATUS_CONFIG.INCOMPLETE;
                        const isOpen = expandedIdx === idx;
                        const hasChecklist = score.checklistItems?.length > 0;

                        return (
                            <div key={idx}>
                                {/* Main row */}
                                <button
                                    onClick={() => setExpandedIdx(isOpen ? null : idx)}
                                    className="w-full text-left px-5 py-3.5 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* ID */}
                                        <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0 w-12 text-center">
                                            {score.subNumber}
                                        </span>

                                        {/* Title + score bar */}
                                        <div className="flex-1 min-w-0 space-y-1.5">
                                            <p className="text-sm font-medium leading-tight truncate">{score.title}</p>
                                            <ScoreBar score={score.estimatedMarks} max={score.maxMarks} />
                                        </div>

                                        {/* Status + confidence + chevron */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge variant="outline" className={`${stat.color} gap-1 text-[10px] hidden sm:flex`}>
                                                {stat.icon}
                                                {stat.label}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                {conf.icon}
                                                {hasChecklist && (
                                                    isOpen
                                                        ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                                                        : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded — justification + checklist */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-4 pt-2 bg-muted/20 space-y-3">
                                                {/* Justification */}
                                                <p className="text-sm text-muted-foreground italic leading-relaxed">
                                                    &ldquo;{score.justification}&rdquo;
                                                </p>

                                                {/* Checklist items */}
                                                {hasChecklist && (
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                                            <FileCheck className="h-3 w-3" />
                                                            Checklist evaluated
                                                        </p>
                                                        <ul className="space-y-1">
                                                            {score.checklistItems.map((item: string, ci: number) => (
                                                                <li key={ci} className="text-xs text-muted-foreground flex items-start gap-2">
                                                                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-muted-foreground/60 shrink-0" />
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Improvements — show for every sub-criterion with remaining marks */}
                                                {score.estimatedMarks < score.maxMarks && (
                                                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                                                        <p className="text-xs font-semibold text-amber-400 mb-2 flex items-center gap-1.5">
                                                            <Lightbulb className="h-3.5 w-3.5" />
                                                            Improvements — {score.maxMarks - score.estimatedMarks} marks remaining
                                                        </p>
                                                        {score.recommendations && score.recommendations.length > 0 ? (
                                                            <ol className="space-y-1.5 list-none">
                                                                {score.recommendations.map((rec: string, ri: number) => (
                                                                    <li key={ri} className="text-xs text-amber-700 dark:text-amber-200 flex items-start gap-2">
                                                                        <span className="h-4 w-4 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                                                            {ri + 1}
                                                                        </span>
                                                                        {rec}
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        ) : (
                                                            <p className="text-xs text-amber-700 dark:text-amber-200">
                                                                Upload additional supporting documents with clear evidence for this sub-criterion to improve the score.
                                                            </p>
                                                        )}
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
            </Card>
        </motion.div>
    );
}
