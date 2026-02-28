'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import naacService, { NaacCriterion, ComplianceSummary } from '@/lib/services/naacService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, ArrowRight, BarChart3, Loader2, Sparkles, Upload } from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const COLORS = ['bg-blue-500', 'bg-accent0', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-rose-500'];

export default function NaacPage() {
    const [criteria, setCriteria] = useState<NaacCriterion[]>([]);
    const [summary, setSummary] = useState<ComplianceSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);

    const fetchData = async () => {
        try {
            const [criteriaRes, summaryRes] = await Promise.all([
                naacService.getCriteria(),
                naacService.getComplianceSummary(),
            ]);
            const cData = criteriaRes.data as unknown as Record<string, unknown>;
            const sData = summaryRes.data as unknown as Record<string, unknown>;
            setCriteria((cData.data as NaacCriterion[]) || (criteriaRes.data as NaacCriterion[]));
            setSummary((sData.data as ComplianceSummary) || (summaryRes.data as ComplianceSummary));
        } catch {
            toast.error('Failed to load NAAC data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleInitialize = async () => {
        setInitializing(true);
        try {
            await naacService.initSubCriteria();
            toast.success('Sub-criteria initialized!');
            fetchData();
        } catch {
            toast.error('Failed to initialize sub-criteria');
        } finally {
            setInitializing(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
                </div>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">NAAC Accreditation</h1>
                    <p className="text-muted-foreground mt-1">Manage all 7 criteria for NAAC compliance</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Files
                    </Button>
                    <Button onClick={handleInitialize} disabled={initializing} variant="outline">
                        {initializing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Initialize Sub-Criteria
                    </Button>
                </div>
            </motion.div>

            {/* Overall Compliance Card */}
            {summary && (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50 bg-gradient-to-r from-foreground/5 to-foreground/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                                        <BarChart3 className="h-6 w-6 text-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">Overall Compliance</p>
                                        <p className="text-sm text-muted-foreground">Across all 7 criteria</p>
                                    </div>
                                </div>
                                <span className="text-4xl font-bold text-foreground">{summary.overallPercentage?.toFixed(1) || 0}%</span>
                            </div>
                            <Progress value={summary.overallPercentage || 0} className="h-3" />
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Criteria Cards Grid */}
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(criteria.length > 0 ? criteria : Array.from({ length: 7 }, (_, i) => ({
                    id: String(i + 1), number: i + 1, name: `Criterion ${i + 1}`,
                    description: 'NAAC criterion details', weightage: 100, completionPercentage: 0,
                } as NaacCriterion))).map((criterion, i) => {
                    // Backend returns criterionNumber/title/complianceScore; fallback to number/name/completionPercentage
                    const raw = criterion as unknown as Record<string, unknown>;
                    const cNumber = (raw.criterionNumber as number) || criterion.number || (i + 1);
                    const cTitle = (raw.title as string) || criterion.name || `Criterion ${i + 1}`;
                    const cScore = (raw.complianceScore as number) ?? criterion.completionPercentage ?? 0;
                    return (
                        <motion.div key={criterion.id} variants={fadeIn}>
                            <Link href={`/naac/${criterion.id}`}>
                                <Card className="group hover:shadow-lg hover:border-border transition-all duration-300 cursor-pointer border-border/50 h-full">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <Badge className={`${COLORS[i % 7]} text-white border-0`}>
                                                Criterion {cNumber}
                                            </Badge>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </div>
                                        <CardTitle className="text-lg mt-2">{cTitle}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Progress</span>
                                                <span className="font-medium">{cScore.toFixed?.(0) || 0}%</span>
                                            </div>
                                            <Progress value={cScore} className="h-2" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
