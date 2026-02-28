'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, TrendingUp, Star, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { sssService, SurveyTemplate, SurveyResults } from '@/lib/services/sssService';

export default function SurveyResultsPage() {
    const [templates, setTemplates] = useState<SurveyTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [results, setResults] = useState<SurveyResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingResults, setLoadingResults] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await sssService.getTemplates();
                const ts = res.data.data || [];
                setTemplates(ts);
                if (ts.length > 0) {
                    setSelectedTemplateId(ts[0].id);
                    loadResults(ts[0].id);
                }
            } catch { toast.error('Failed to load templates'); }
            finally { setLoading(false); }
        })();
    }, []);

    const loadResults = async (id: string) => {
        setLoadingResults(true);
        try {
            const res = await sssService.getResults(id);
            setResults(res.data.data);
        } catch { toast.error('Failed to load results'); }
        finally { setLoadingResults(false); }
    };

    const handleTemplateChange = (id: string) => {
        setSelectedTemplateId(id);
        loadResults(id);
    };

    const ratingColor = (val: number) => {
        if (val >= 4) return 'text-emerald-400';
        if (val >= 3) return 'text-amber-400';
        return 'text-red-400';
    };

    const satisfactionColor = (pct: number) => {
        if (pct >= 75) return 'bg-emerald-500';
        if (pct >= 50) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Survey Results</h1>
                        <p className="text-muted-foreground mt-1">Analyze student satisfaction survey responses</p>
                    </div>
                    <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                        <SelectTrigger className="w-64"><SelectValue placeholder="Select survey" /></SelectTrigger>
                        <SelectContent>
                            {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.title} ({t.academicYear})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {loading || loadingResults ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : !results ? (
                <Card className="bg-card/50"><CardContent className="p-12 text-center text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a survey to view results.</p>
                </CardContent></Card>
            ) : (
                <>
                    {/* Summary Cards */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="bg-card/50 backdrop-blur">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/20">
                                        <Users className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{results.totalResponses}</p>
                                        <p className="text-xs text-muted-foreground">Total Responses</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-amber-500/20">
                                        <Star className="h-5 w-5 text-amber-400" />
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-bold ${ratingColor(results.overallSatisfaction)}`}>{results.overallSatisfaction.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">Avg Rating (out of 5)</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-emerald-500/20">
                                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{Math.round(results.overallSatisfaction * 20)}%</p>
                                        <p className="text-xs text-muted-foreground">Satisfaction Score</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-card/50 backdrop-blur">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-purple-500/20">
                                        <BarChart3 className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{results.questionResults?.length || 0}</p>
                                        <p className="text-xs text-muted-foreground">Questions Analyzed</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    {/* Question-wise Results */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Question-wise Analysis</CardTitle>
                                <CardDescription>Detailed breakdown of each question&apos;s ratings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {results.questionResults?.map((q, i) => (
                                    <div key={q.questionId} className="p-4 rounded-lg bg-muted/30">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Q{i + 1}. {q.questionText}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{q.totalAnswers} answers</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-lg font-bold ${ratingColor(q.avgRating)}`}>{q.avgRating.toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground">{q.satisfactionPercent}% satisfaction</p>
                                            </div>
                                        </div>
                                        {q.questionType === 'RATING' && q.distribution && (
                                            <div className="grid grid-cols-5 gap-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <div key={star} className="text-center">
                                                        <div className="h-16 flex items-end justify-center">
                                                            <div
                                                                className={`w-8 rounded-t ${satisfactionColor(star * 20)}`}
                                                                style={{ height: `${q.totalAnswers > 0 ? ((q.distribution[star] || 0) / q.totalAnswers) * 100 : 0}%`, minHeight: '2px' }}
                                                            />
                                                        </div>
                                                        <p className="text-xs mt-1">{star}★</p>
                                                        <p className="text-[10px] text-muted-foreground">{q.distribution[star] || 0}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Department Breakdown */}
                    {results.departmentBreakdown?.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Department Breakdown</CardTitle>
                                    <CardDescription>Satisfaction by department</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {results.departmentBreakdown.map(d => (
                                        <div key={d.department} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{d.department}</p>
                                                <p className="text-xs text-muted-foreground">{d.responseCount} responses</p>
                                            </div>
                                            <div className="w-32">
                                                <Progress value={d.satisfactionPercent} className="h-2" />
                                            </div>
                                            <div className="text-right w-16">
                                                <p className={`text-sm font-bold ${ratingColor(d.avgRating)}`}>{d.avgRating.toFixed(1)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
}
