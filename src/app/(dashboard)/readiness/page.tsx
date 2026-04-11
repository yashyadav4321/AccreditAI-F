'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import readinessService, { ReadinessScore } from '@/lib/services/readinessService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Gauge, GraduationCap, FileText, ClipboardCheck,
    CheckCircle, AlertTriangle, Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const ICONS: Record<string, React.ReactNode> = {
    naac: <GraduationCap className="h-5 w-5" />,
    documents: <FileText className="h-5 w-5" />,
    dvv: <ClipboardCheck className="h-5 w-5" />,
};

function scoreColor(score: number) {
    if (score >= 75) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
}

function scoreGradient(score: number) {
    if (score >= 75) return 'from-emerald-500/20 to-emerald-500/5';
    if (score >= 50) return 'from-amber-500/20 to-amber-500/5';
    return 'from-red-500/20 to-red-500/5';
}

export default function ReadinessPage() {
    const [data, setData] = useState<ReadinessScore | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        readinessService.getScore()
            .then((res) => {
                const raw = res.data as any;
                setData(raw?.data ?? raw);
            })
            .catch(() => toast.error('Failed to load readiness score'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-48" />
                <div className="grid grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20">
                <Gauge className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h2 className="text-xl font-semibold">Unable to calculate readiness</h2>
                <p className="text-muted-foreground mt-1">Ensure you have data in at least one module (NAAC)</p>
            </div>
        );
    }

    const overall = Math.round(data.overallScore);
    const breakdown = data.breakdown ? Object.entries(data.breakdown) : [];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            {/* Header */}
            <motion.div variants={fadeIn}>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Gauge className="h-8 w-8" />
                    Accreditation Readiness
                </h1>
                <p className="text-muted-foreground mt-1">Overall readiness score based on all accreditation modules</p>
            </motion.div>

            {/* Main Score */}
            <motion.div variants={fadeIn}>
                <Card className={`border-border/50 bg-gradient-to-br ${scoreGradient(overall)}`}>
                    <CardContent className="p-8 text-center">
                        <p className={`text-7xl font-bold ${scoreColor(overall)}`}>{overall}%</p>
                        <p className="text-lg text-muted-foreground mt-2">Overall Readiness Score</p>
                        <Progress value={overall} className="h-3 mt-4 max-w-md mx-auto" />
                        <div className="flex items-center justify-center gap-2 mt-4">
                            {overall >= 75 ? (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-sm px-3 py-1">
                                    <CheckCircle className="h-4 w-4 mr-1" /> Ready for Accreditation
                                </Badge>
                            ) : overall >= 50 ? (
                                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-sm px-3 py-1">
                                    <AlertTriangle className="h-4 w-4 mr-1" /> Needs Improvement
                                </Badge>
                            ) : (
                                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-sm px-3 py-1">
                                    <AlertTriangle className="h-4 w-4 mr-1" /> Not Ready
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Breakdown Cards */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {breakdown.map(([key, item]) => {
                    const score = Math.round(item.score);
                    return (
                        <Card key={key} className="border-border/50 hover:border-border transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                        {ICONS[key] || <Gauge className="h-5 w-5" />}
                                    </div>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </div>
                                <p className={`text-3xl font-bold ${scoreColor(score)}`}>{score}%</p>
                                <Progress value={score} className="h-2 mt-2" />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Weight: {Math.round(item.weight * 100)}%
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </motion.div>

            {/* Recommendations */}
            {data.actions && data.actions.length > 0 && (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                                <Lightbulb className="h-5 w-5 text-amber-500" />
                                Recommended Actions
                            </h3>
                            <div className="space-y-3">
                                {data.actions.map((action, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                        <span className="h-6 w-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs font-bold shrink-0">
                                            {i + 1}
                                        </span>
                                        <p className="text-sm">{action}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}
