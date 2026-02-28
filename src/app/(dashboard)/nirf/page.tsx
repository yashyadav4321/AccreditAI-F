'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import nirfService, { NirfParameter, NirfScoreSummary } from '@/lib/services/nirfService';
import { nirfComparisonService, NirfHistoricalScore } from '@/lib/services/nirfComparisonService';
import aiService from '@/lib/services/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, Brain, Loader2, Plus, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981'];
const PARAM_LABELS: Record<string, string> = {
    TLR: 'Teaching, Learning & Resources', RPC: 'Research & Professional Practice',
    GO: 'Graduation Outcomes', OI: 'Outreach & Inclusivity', PR: 'Peer Perception',
};

export default function NirfPage() {
    const [parameters, setParameters] = useState<NirfParameter[]>([]);
    const [summary, setSummary] = useState<NirfScoreSummary | null>(null);
    const [latestHistorical, setLatestHistorical] = useState<NirfHistoricalScore | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ parameterId: '', year: new Date().getFullYear(), value: 0 });

    const getRankBand = (score: number): string => {
        if (score >= 75) return '1-50';
        if (score >= 60) return '51-100';
        if (score >= 45) return '101-150';
        if (score >= 30) return '151-200';
        return '200+';
    };

    const fetchData = async () => {
        try {
            const [paramRes, summaryRes, compRes] = await Promise.all([
                nirfService.getParameters(),
                nirfService.getScoreSummary().catch(() => null),
                nirfComparisonService.getComparisonData().catch(() => null),
            ]);
            const pRaw = paramRes.data as unknown as Record<string, unknown>;
            const paramArr = (pRaw.data as NirfParameter[]) || (Array.isArray(pRaw) ? pRaw as unknown as NirfParameter[] : []);
            setParameters(paramArr);
            if (summaryRes) {
                const sRaw = summaryRes.data as unknown as Record<string, unknown>;
                setSummary((sRaw.data as NirfScoreSummary) || sRaw as unknown as NirfScoreSummary);
            }
            // Pull the most recent historical year's data
            if (compRes) {
                const cRaw = compRes.data as unknown as Record<string, unknown>;
                const comparison = cRaw.data as { historical?: NirfHistoricalScore[] } | undefined;
                const hist = comparison?.historical;
                if (hist && hist.length > 0) {
                    // Sort descending by academicYear and pick the latest
                    const sorted = [...hist].sort((a, b) => b.academicYear.localeCompare(a.academicYear));
                    setLatestHistorical(sorted[0]);
                }
            }
        } catch { toast.error('Failed to load NIRF data'); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const addEntry = async () => {
        setAdding(true);
        try {
            await nirfService.addDataEntry({ metricId: form.parameterId, year: String(form.year), value: form.value });
            toast.success('Data entry added');
            setAddOpen(false);
            fetchData();
        } catch { toast.error('Failed to add entry'); } finally { setAdding(false); }
    };

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            await aiService.analyzeNirf();
            toast.success('NIRF analysis started! Check AI Analysis page.');
        } catch { toast.error('Analysis failed'); } finally { setAnalyzing(false); }
    };

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-80" /><Skeleton className="h-80" /></div>;

    // Use historical data for charts if available, else fall back to parameters
    const estimatedScore = latestHistorical?.overallScore || summary?.totalScore || 0;
    const rankBand = latestHistorical ? getRankBand(latestHistorical.overallScore) : (summary as unknown as Record<string, unknown>)?.rankBand as string || 'N/A';

    const PARAM_CODES = ['TLR', 'RPC', 'GO', 'OI', 'Perception'];
    const historicalChartData = latestHistorical ? [
        { name: 'TLR', score: latestHistorical.tlrScore || 0, max: 100, fill: COLORS[0] },
        { name: 'RPC', score: latestHistorical.rpcScore || 0, max: 100, fill: COLORS[1] },
        { name: 'GO', score: latestHistorical.goScore || 0, max: 100, fill: COLORS[2] },
        { name: 'OI', score: latestHistorical.oiScore || 0, max: 100, fill: COLORS[3] },
        { name: 'Perception', score: latestHistorical.perceptionScore || 0, max: 100, fill: COLORS[4] },
    ] : null;

    // Chart data — prefer historical, else use parameter scores
    const pRaw = parameters as unknown as Record<string, unknown>[];
    const chartData = historicalChartData || parameters.map((p, i) => ({
        name: (p as unknown as Record<string, unknown>).code as string || p.name,
        score: p.currentScore || 0,
        max: p.maxScore || 100,
        fill: COLORS[i % COLORS.length],
    }));

    const radarData = historicalChartData
        ? historicalChartData.map(d => ({ param: d.name, score: d.score, fullMark: d.max }))
        : parameters.map(p => ({
            param: (p as unknown as Record<string, unknown>).code as string || p.name,
            score: p.currentScore || 0,
            fullMark: p.maxScore || 100,
        }));

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">NIRF Rankings</h1>
                    <p className="text-muted-foreground mt-1">Track and improve your NIRF ranking parameters</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={addOpen} onOpenChange={setAddOpen}>
                        <DialogTrigger asChild><Button variant="outline"><Plus className="mr-2 h-4 w-4" />Add Data</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add NIRF Data Entry</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Parameter</Label>
                                    <select className="w-full border rounded-md p-2 bg-background" value={form.parameterId} onChange={e => setForm({ ...form, parameterId: e.target.value })}>
                                        <option value="">Select parameter</option>
                                        {parameters.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} /></div>
                                    <div className="space-y-2"><Label>Value</Label><Input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} /></div>
                                </div>
                                <Button onClick={addEntry} disabled={adding} className="w-full bg-foreground text-background hover:bg-foreground/90">
                                    {adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : 'Add Entry'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Button onClick={runAnalysis} disabled={analyzing} className="bg-foreground text-background hover:bg-foreground/90">
                        {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Brain className="mr-2 h-4 w-4" />Run AI Analysis</>}
                    </Button>
                </div>
            </motion.div>

            {/* Overall Score Card */}
            {(latestHistorical || summary) && (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <TrendingUp className="h-7 w-7 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Estimated NIRF Score</p>
                                    <p className="text-4xl font-bold">{typeof estimatedScore === 'number' ? estimatedScore.toFixed(1) : 0}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Estimated Rank Band</p>
                                <Badge className="text-lg px-4 py-1" variant="secondary">{rankBand}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-foreground" />Parameter Scores</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                    <Bar dataKey="score" radius={[6, 6, 0, 0]} fill="#4F46E5" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-muted-foreground" />Radar Overview</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="hsl(var(--border))" />
                                    <PolarAngleAxis dataKey="param" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                                    <Radar name="Score" dataKey="score" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Parameter Cards */}
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parameters.map((param, i) => {
                    const raw = param as unknown as Record<string, unknown>;
                    const pCode = (raw.parameterNumber as string) || (raw.code as string) || String(i + 1);
                    const pTitle = (raw.title as string) || param.name || '';
                    const pScore = (raw.score as number) ?? param.currentScore ?? 0;
                    const pMax = param.maxScore || 100;
                    return (
                        <motion.div key={param.id} variants={fadeIn}>
                            <Card className="border-border/50 hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge style={{ backgroundColor: COLORS[i % COLORS.length] }} className="text-white border-0">{pCode}</Badge>
                                        <span className="text-2xl font-bold">{typeof pScore === 'number' ? pScore.toFixed(1) : 0}</span>
                                    </div>
                                    <h3 className="font-medium mb-1">{pTitle}</h3>
                                    <p className="text-xs text-muted-foreground mb-3">{PARAM_LABELS[String(pCode)] || param.description}</p>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-muted-foreground">Score</span>
                                            <span>{typeof pScore === 'number' ? pScore.toFixed(1) : 0} / {pMax}</span>
                                        </div>
                                        <Progress value={(pScore / pMax) * 100} className="h-2" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
