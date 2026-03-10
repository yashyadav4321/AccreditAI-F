import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Brain,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    TrendingUp,
    FileCheck,
    BarChart3,
    ChevronDown,
    ChevronUp,
    ClipboardCheck,
    ShieldCheck,
    XCircle,
} from 'lucide-react';
import { NaacDocumentAnalysisResult, NaacSubCriterionScore } from '@/lib/services/naacService';

interface MarksMatrixProps {
    result: NaacDocumentAnalysisResult;
}

const CONFIDENCE_CONFIG = {
    HIGH: {
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        label: 'High Confidence'
    },
    MEDIUM: {
        icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
        color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        label: 'Medium Confidence'
    },
    LOW: {
        icon: <HelpCircle className="h-4 w-4 text-slate-400" />,
        color: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        label: 'Low Confidence'
    }
};

const STATUS_CONFIG = {
    COMPLETE: {
        icon: <ShieldCheck className="h-4 w-4" />,
        color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        label: 'Complete',
    },
    PARTIAL: {
        icon: <AlertCircle className="h-4 w-4" />,
        color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        label: 'Partial',
    },
    INCOMPLETE: {
        icon: <XCircle className="h-4 w-4" />,
        color: 'bg-red-500/15 text-red-400 border-red-500/30',
        label: 'Incomplete',
    },
};

export function MarksMatrix({ result }: MarksMatrixProps) {
    const overallPercentage = (result.overallEstimatedScore / result.maxPossibleScore) * 100;
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    const completeCount = result.subCriteriaScores.filter(s => s.status === 'COMPLETE').length;
    const partialCount = result.subCriteriaScores.filter(s => s.status === 'PARTIAL').length;
    const incompleteCount = result.subCriteriaScores.filter(s => s.status === 'INCOMPLETE').length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mt-8"
        >
            <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Analysis Results: Estimated Marks</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Readiness Summary */}
                <Card className="md:col-span-2 border-border/50 bg-gradient-to-br from-background to-muted/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Overall Readiness Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm leading-relaxed mb-4">{result.summary}</p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Estimated Score</span>
                                <span className="text-2xl font-bold text-primary">
                                    {result.overallEstimatedScore.toFixed(1)} / {result.maxPossibleScore}
                                </span>
                            </div>
                            <Progress value={overallPercentage} className="h-3" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>0</span>
                                <span>{overallPercentage.toFixed(1)}% Compliance</span>
                                <span>{result.maxPossibleScore}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="border-border/50 bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">Analyzed Elements</span>
                            <span className="font-semibold">{result.subCriteriaScores.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-sm text-muted-foreground">Complete</span>
                            </div>
                            <span className="font-semibold text-emerald-400">{completeCount}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-amber-500" />
                                <span className="text-sm text-muted-foreground">Partial</span>
                            </div>
                            <span className="font-semibold text-amber-400">{partialCount}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border/50">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                <span className="text-sm text-muted-foreground">Incomplete</span>
                            </div>
                            <span className="font-semibold text-red-400">{incompleteCount}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-muted-foreground">Processing Time</span>
                            <span className="font-semibold">{result.processingTime}ms</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Checklist Source Card */}
            {result.checklistUsed && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
                        <CardContent className="p-5 flex items-start gap-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                                <ClipboardCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold text-sm mb-1">Checklist Source Used for Analysis</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">{result.checklistUsed}</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Detailed Marks Table */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <CardTitle>Detailed Marks Matrix</CardTitle>
                    <CardDescription>
                        Per-criterion marks estimation with status, checklist items, and confidence levels.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-background hover:bg-background">
                                    <TableHead className="w-[90px]">ID</TableHead>
                                    <TableHead className="min-w-[180px]">Sub-Criterion</TableHead>
                                    <TableHead className="text-center">Marks</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Confidence</TableHead>
                                    <TableHead className="min-w-[280px]">AI Justification</TableHead>
                                    <TableHead className="w-[50px] text-center">Checklist</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.subCriteriaScores.map((score: NaacSubCriterionScore, index: number) => {
                                    const conf = CONFIDENCE_CONFIG[score.confidence] || CONFIDENCE_CONFIG.LOW;
                                    const stat = STATUS_CONFIG[score.status] || STATUS_CONFIG.INCOMPLETE;
                                    const isExpanded = expandedRow === index;

                                    return (
                                        <React.Fragment key={index}>
                                            <TableRow className="hover:bg-muted/20 transition-colors">
                                                <TableCell className="font-mono text-xs font-bold">{score.subNumber}</TableCell>
                                                <TableCell className="font-medium text-sm">{score.title}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="font-bold border-primary/30">
                                                        {score.estimatedMarks} / {score.maxMarks}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className={`${stat.color} gap-1`}>
                                                        {stat.icon}
                                                        {stat.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        {conf.icon}
                                                        <span className="text-[10px] font-medium uppercase tracking-wider">{score.confidence}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground leading-relaxed italic">
                                                    &quot;{score.justification}&quot;
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {score.checklistItems && score.checklistItems.length > 0 && (
                                                        <button
                                                            onClick={() => setExpandedRow(isExpanded ? null : index)}
                                                            className="p-1 rounded hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                                                            title="View checklist items"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                            <AnimatePresence>
                                                {isExpanded && score.checklistItems && score.checklistItems.length > 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={7} className="bg-muted/10 py-0 px-0">
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="p-4 pl-12">
                                                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                                                        <FileCheck className="h-3.5 w-3.5" />
                                                                        NAAC Checklist Items Evaluated
                                                                    </p>
                                                                    <ul className="space-y-1">
                                                                        {score.checklistItems.map((item: string, ci: number) => (
                                                                            <li key={ci} className="text-sm text-muted-foreground flex items-start gap-2">
                                                                                <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 text-primary/70 shrink-0" />
                                                                                {item}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </motion.div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
