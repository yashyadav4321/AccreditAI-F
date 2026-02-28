'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Plus, Trash2, Calculator, BarChart3, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { nirfComparisonService, NirfHistoricalScore, NirfCompetitor, SimulationResult, ComparisonData } from '@/lib/services/nirfComparisonService';

const currentYear = new Date().getFullYear();

export default function NirfComparisonPage() {
    const [comparison, setComparison] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [addScoreOpen, setAddScoreOpen] = useState(false);
    const [addCompetitorOpen, setAddCompetitorOpen] = useState(false);
    const [scoreForm, setScoreForm] = useState({ academicYear: `${currentYear}-${currentYear + 1}`, overallScore: 0, overallRank: 0, tlrScore: 0, rpcScore: 0, goScore: 0, oiScore: 0, perceptionScore: 0 });
    const [competitorForm, setCompetitorForm] = useState({ name: '', scores: [] as any[] });
    const [simInputs, setSimInputs] = useState({ tlrScore: 50, rpcScore: 50, goScore: 50, oiScore: 50, perceptionScore: 50 });
    const [simResult, setSimResult] = useState<SimulationResult | null>(null);

    const load = async () => {
        try {
            const res = await nirfComparisonService.getComparisonData();
            setComparison(res.data.data);
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleAddScore = async () => {
        try {
            await nirfComparisonService.upsertHistoricalScore(scoreForm);
            toast.success('Score saved');
            setAddScoreOpen(false);
            load();
        } catch { toast.error('Failed to save'); }
    };

    const handleAddCompetitor = async () => {
        try {
            await nirfComparisonService.addCompetitor(competitorForm);
            toast.success('Competitor added');
            setAddCompetitorOpen(false);
            setCompetitorForm({ name: '', scores: [] });
            load();
        } catch { toast.error('Failed to add'); }
    };

    const handleDeleteScore = async (id: string) => {
        try {
            await nirfComparisonService.deleteHistoricalScore(id);
            toast.success('Deleted');
            load();
        } catch { toast.error('Failed to delete'); }
    };

    const handleDeleteCompetitor = async (id: string) => {
        try {
            await nirfComparisonService.deleteCompetitor(id);
            toast.success('Deleted');
            load();
        } catch { toast.error('Failed to delete'); }
    };

    const handleSimulate = async () => {
        try {
            const res = await nirfComparisonService.simulate(simInputs);
            setSimResult(res.data.data);
        } catch { toast.error('Simulation failed'); }
    };

    if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold tracking-tight">NIRF Year-on-Year Comparison</h1>
                <p className="text-muted-foreground mt-1">Track, compare, and simulate NIRF rankings</p>
            </motion.div>

            <Tabs defaultValue="historical">
                <TabsList>
                    <TabsTrigger value="historical"><BarChart3 className="h-4 w-4 mr-2" />Historical Scores</TabsTrigger>
                    <TabsTrigger value="competitors"><TrendingUp className="h-4 w-4 mr-2" />Competitors</TabsTrigger>
                    <TabsTrigger value="simulator"><Calculator className="h-4 w-4 mr-2" />Score Simulator</TabsTrigger>
                </TabsList>

                <TabsContent value="historical" className="mt-4 space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={addScoreOpen} onOpenChange={setAddScoreOpen}>
                            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Year Data</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add/Update Score</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2"><Label>Academic Year</Label><Input value={scoreForm.academicYear} onChange={e => setScoreForm({ ...scoreForm, academicYear: e.target.value })} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2"><Label>Overall Score</Label><Input type="number" value={scoreForm.overallScore} onChange={e => setScoreForm({ ...scoreForm, overallScore: parseFloat(e.target.value) })} /></div>
                                        <div className="grid gap-2"><Label>Rank</Label><Input type="number" value={scoreForm.overallRank} onChange={e => setScoreForm({ ...scoreForm, overallRank: parseInt(e.target.value) })} /></div>
                                    </div>
                                    {['tlrScore', 'rpcScore', 'goScore', 'oiScore', 'perceptionScore'].map(key => (
                                        <div key={key} className="grid gap-2"><Label>{key.replace('Score', '').toUpperCase()}</Label><Input type="number" value={(scoreForm as any)[key]} onChange={e => setScoreForm({ ...scoreForm, [key]: parseFloat(e.target.value) })} /></div>
                                    ))}
                                </div>
                                <DialogFooter><Button onClick={handleAddScore}>Save</Button></DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Year-on-Year Chart (simplified as table) */}
                    <Card>
                        <CardHeader><CardTitle>Score Trends</CardTitle></CardHeader>
                        <CardContent>
                            {!comparison?.historical?.length ? (
                                <p className="text-center text-muted-foreground py-8">No data yet. Add your NIRF scores above.</p>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow>
                                        <TableHead>Year</TableHead><TableHead>Score</TableHead><TableHead>Rank</TableHead><TableHead>TLR</TableHead><TableHead>RPC</TableHead><TableHead>GO</TableHead><TableHead>OI</TableHead><TableHead>Perc.</TableHead><TableHead></TableHead>
                                    </TableRow></TableHeader>
                                    <TableBody>
                                        {comparison.historical.map(h => (
                                            <TableRow key={h.id}>
                                                <TableCell className="font-medium">{h.academicYear}</TableCell>
                                                <TableCell><Badge>{h.overallScore}</Badge></TableCell>
                                                <TableCell>{h.overallRank || '—'}</TableCell>
                                                <TableCell>{h.tlrScore || '—'}</TableCell>
                                                <TableCell>{h.rpcScore || '—'}</TableCell>
                                                <TableCell>{h.goScore || '—'}</TableCell>
                                                <TableCell>{h.oiScore || '—'}</TableCell>
                                                <TableCell>{h.perceptionScore || '—'}</TableCell>
                                                <TableCell><Button variant="ghost" size="icon" onClick={() => handleDeleteScore(h.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="competitors" className="mt-4 space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={addCompetitorOpen} onOpenChange={setAddCompetitorOpen}>
                            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Competitor</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add Competitor</DialogTitle><DialogDescription>Add an institution to benchmark against.</DialogDescription></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2"><Label>Institution Name</Label><Input value={competitorForm.name} onChange={e => setCompetitorForm({ ...competitorForm, name: e.target.value })} /></div>
                                </div>
                                <DialogFooter><Button onClick={handleAddCompetitor} disabled={!competitorForm.name}>Add</Button></DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card>
                        <CardHeader><CardTitle>Competitor Institutions</CardTitle></CardHeader>
                        <CardContent>
                            {!comparison?.competitors?.length ? (
                                <p className="text-center text-muted-foreground py-8">No competitors added yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {comparison.competitors.map(c => (
                                        <div key={c.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                            <p className="font-medium text-sm">{c.name}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{(c.scores as any[]).length} years</Badge>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteCompetitor(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="simulator" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Parameter Inputs</CardTitle><CardDescription>Adjust parameter scores to estimate rank</CardDescription></CardHeader>
                            <CardContent className="space-y-6">
                                {[
                                    { key: 'tlrScore', label: 'Teaching, Learning & Resources (TLR)', weight: '30%' },
                                    { key: 'rpcScore', label: 'Research & Professional Practice (RPC)', weight: '30%' },
                                    { key: 'goScore', label: 'Graduation Outcomes (GO)', weight: '20%' },
                                    { key: 'oiScore', label: 'Outreach & Inclusivity (OI)', weight: '10%' },
                                    { key: 'perceptionScore', label: 'Perception', weight: '10%' },
                                ].map(p => (
                                    <div key={p.key} className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label className="text-sm">{p.label} <span className="text-muted-foreground">({p.weight})</span></Label>
                                            <span className="text-sm font-medium">{(simInputs as any)[p.key]}</span>
                                        </div>
                                        <Slider
                                            value={[(simInputs as any)[p.key]]}
                                            onValueChange={([v]: number[]) => setSimInputs({ ...simInputs, [p.key]: v })}
                                            max={100}
                                            step={1}
                                        />
                                    </div>
                                ))}
                                <Button className="w-full" onClick={handleSimulate}><Calculator className="h-4 w-4 mr-2" />Simulate</Button>
                            </CardContent>
                        </Card>

                        {simResult && (
                            <Card className="bg-card/50 backdrop-blur">
                                <CardHeader><CardTitle>Simulation Results</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="text-center py-4">
                                        <p className="text-5xl font-bold">{simResult.estimatedScore}</p>
                                        <p className="text-sm text-muted-foreground mt-1">Estimated Overall Score</p>
                                        <Badge className="mt-3 text-lg px-4 py-1 bg-blue-500/20 text-blue-400">{simResult.estimatedRankBracket}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        {simResult.breakdown.map(b => (
                                            <div key={b.parameter} className="flex items-center justify-between py-2 px-3 rounded bg-muted/30">
                                                <span className="text-sm">{b.parameter}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-muted-foreground">{b.score} × {b.weight}</span>
                                                    <Badge variant="outline">{b.contribution}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
