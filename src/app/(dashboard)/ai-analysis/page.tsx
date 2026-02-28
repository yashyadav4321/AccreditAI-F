'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import aiService from '@/lib/services/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, FileBarChart, ArrowRight, Clock } from 'lucide-react';
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
}

export default function AiAnalysisPage() {
    const [reports, setReports] = useState<AiReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await aiService.getReports();
                const d = res.data as unknown as Record<string, unknown>;
                setReports((d.data as AiReport[]) || (Array.isArray(d) ? d as AiReport[] : []));
            } catch { toast.error('Failed to load AI reports'); } finally { setLoading(false); }
        };
        fetchReports();
    }, []);

    const getStatusColor = (s: string) => {
        switch (s) { case 'COMPLETED': return 'bg-emerald-500'; case 'PENDING': case 'IN_PROGRESS': return 'bg-amber-500'; case 'FAILED': return 'bg-red-500'; default: return 'bg-muted'; }
    };
    const getFrameworkColor = (f: string) => {
        switch (f) { case 'NAAC': return 'bg-blue-500/10 text-blue-600'; case 'NBA': return 'bg-accent0/10 text-foreground'; case 'NIRF': return 'bg-amber-500/10 text-amber-600'; default: return 'bg-muted text-muted-foreground'; }
    };

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40" />)}</div></div>;

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
                        <p className="text-sm text-muted-foreground">Run AI analysis from NAAC, NBA, or NIRF pages to generate gap analysis reports.</p>
                    </CardContent></Card>
                </motion.div>
            ) : (
                <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map(report => (
                        <motion.div key={report.id} variants={fadeIn}>
                            <Link href={`/ai-analysis/${report.id}`}>
                                <Card className="group hover:shadow-lg hover:border-border transition-all duration-300 cursor-pointer border-border/50 h-full">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getFrameworkColor(report.framework)}>{report.framework}</Badge>
                                                <Badge className={`${getStatusColor(report.status)} text-white border-0`}>{report.status}</Badge>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        </div>
                                        <CardTitle className="text-lg mt-3">{report.type?.replace(/_/g, ' ') || 'Gap Analysis'}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {report.summary && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{report.summary}</p>}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>{format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
}
