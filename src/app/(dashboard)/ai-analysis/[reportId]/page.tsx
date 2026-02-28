'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import aiService from '@/lib/services/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Brain, AlertTriangle, CheckCircle2, TrendingUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AiReport {
    id: string;
    type: string;
    framework: string;
    status: string;
    summary?: string;
    gaps?: { area: string; severity: string; description: string; recommendation: string }[];
    recommendations?: string[];
    score?: number;
    createdAt: string;
    rawResponse?: string;
}

export default function AiReportDetailPage() {
    const params = useParams();
    const reportId = params.reportId as string;
    const [report, setReport] = useState<AiReport | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await aiService.getReportById(reportId);
                const d = res.data as unknown as Record<string, unknown>;
                setReport((d.data as AiReport) || d as unknown as AiReport);
            } catch { toast.error('Failed to load report'); } finally { setLoading(false); }
        };
        fetch();
    }, [reportId]);

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-40" /><Skeleton className="h-80" /></div>;
    if (!report) return <p className="text-center text-muted-foreground py-16">Report not found.</p>;

    const severityColor = (s: string) => {
        switch (s.toUpperCase()) { case 'HIGH': case 'CRITICAL': return 'text-red-500'; case 'MEDIUM': return 'text-amber-500'; default: return 'text-blue-500'; }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{report.framework}</Badge>
                        <Badge className={`${report.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'} text-white border-0`}>{report.status}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold">{report.type?.replace(/_/g, ' ') || 'AI Analysis Report'}</h1>
                    <p className="text-muted-foreground mt-1">Generated on {format(new Date(report.createdAt), 'MMMM d, yyyy h:mm a')}</p>
                </div>
                {report.score != null && (
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="text-4xl font-bold">{report.score}</p>
                    </div>
                )}
            </div>

            {/* Summary */}
            {report.summary && (
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" />Summary</CardTitle></CardHeader>
                    <CardContent><p className="text-sm leading-relaxed">{report.summary}</p></CardContent>
                </Card>
            )}

            {/* Gaps */}
            {report.gaps && report.gaps.length > 0 && (
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
            )}

            {/* Recommendations */}
            {report.recommendations && report.recommendations.length > 0 && (
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" />Recommendations</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {report.recommendations.map((r, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                    <span className="h-6 w-6 rounded-full bg-accent text-foreground flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                    <span>{r}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Raw Response Fallback */}
            {!report.gaps && !report.recommendations && report.rawResponse && (
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-muted-foreground" />Raw Response</CardTitle></CardHeader>
                    <CardContent><pre className="text-xs bg-muted/30 p-4 rounded-lg whitespace-pre-wrap overflow-x-auto">{report.rawResponse}</pre></CardContent>
                </Card>
            )}
        </motion.div>
    );
}
