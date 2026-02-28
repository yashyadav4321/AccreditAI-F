'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import nbaService, { NbaProgram, ProgramOutcome, CourseOutcome, CoPoMapping } from '@/lib/services/nbaService';
import aiService from '@/lib/services/aiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Brain, Loader2, Target, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function NbaProgramPage() {
    const params = useParams();
    const programId = params.programId as string;
    const [program, setProgram] = useState<NbaProgram | null>(null);
    const [matrix, setMatrix] = useState<Record<string, unknown> | null>(null);
    const [attainment, setAttainment] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [addPoOpen, setAddPoOpen] = useState(false);
    const [addCoOpen, setAddCoOpen] = useState(false);
    const [poForm, setPoForm] = useState({ type: 'PO' as 'PO' | 'PSO', number: 1, description: '' });
    const [coForm, setCoForm] = useState({ courseCode: '', courseName: '', number: 1, description: '' });

    const fetchData = async () => {
        try {
            const [progRes, matrixRes, attRes] = await Promise.all([
                nbaService.getProgramById(programId),
                nbaService.getMappingMatrix(programId).catch(() => null),
                nbaService.getAttainment(programId).catch(() => null),
            ]);
            const d = progRes.data as unknown as Record<string, unknown>;
            setProgram((d.data as NbaProgram) || d as unknown as NbaProgram);
            if (matrixRes) { const m = matrixRes.data as Record<string, unknown>; setMatrix((m.data as Record<string, unknown>) || m); }
            if (attRes) { const a = attRes.data as Record<string, unknown>; setAttainment((a.data as Record<string, unknown>) || a); }
        } catch { toast.error('Failed to load program'); } finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [programId]);

    const addOutcome = async () => {
        try {
            await nbaService.createOutcome({ programId, ...poForm });
            toast.success('Outcome added');
            setAddPoOpen(false);
            fetchData();
        } catch { toast.error('Failed to add outcome'); }
    };

    const addCourseOutcome = async () => {
        try {
            await nbaService.createCourseOutcome({ programId, ...coForm });
            toast.success('Course outcome added');
            setAddCoOpen(false);
            fetchData();
        } catch { toast.error('Failed to add CO'); }
    };

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            await aiService.analyzeNba({ programId });
            toast.success('NBA analysis started! Check AI Analysis page.');
        } catch { toast.error('Analysis failed'); } finally { setAnalyzing(false); }
    };

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-64" /></div>;

    const outcomes = program?.outcomes || [];
    const cos = program?.courseOutcomes || [];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{program?.level}</Badge>
                        <Badge variant="outline">{program?.code}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold">{program?.name}</h1>
                    <p className="text-muted-foreground mt-1">Duration: {program?.duration} years</p>
                </div>
                <Button onClick={runAnalysis} disabled={analyzing} className="bg-foreground text-background hover:bg-foreground/90">
                    {analyzing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Brain className="mr-2 h-4 w-4" />Run NBA Analysis</>}
                </Button>
            </div>

            <Tabs defaultValue="outcomes" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="outcomes">PO / PSO</TabsTrigger>
                    <TabsTrigger value="cos">Course Outcomes</TabsTrigger>
                    <TabsTrigger value="matrix">CO-PO Matrix</TabsTrigger>
                    <TabsTrigger value="attainment">Attainment</TabsTrigger>
                </TabsList>

                {/* Program Outcomes Tab */}
                <TabsContent value="outcomes">
                    <Card className="border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-foreground" />Program Outcomes</CardTitle>
                            <Dialog open={addPoOpen} onOpenChange={setAddPoOpen}>
                                <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" />Add Outcome</Button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Add Program Outcome</DialogTitle></DialogHeader>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Type</Label>
                                                <select className="w-full border rounded-md p-2 bg-background" value={poForm.type} onChange={e => setPoForm({ ...poForm, type: e.target.value as 'PO' | 'PSO' })}>
                                                    <option value="PO">PO</option><option value="PSO">PSO</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2"><Label>Number</Label><Input type="number" value={poForm.number} onChange={e => setPoForm({ ...poForm, number: Number(e.target.value) })} /></div>
                                        </div>
                                        <div className="space-y-2"><Label>Description</Label><Textarea value={poForm.description} onChange={e => setPoForm({ ...poForm, description: e.target.value })} /></div>
                                        <Button onClick={addOutcome} className="w-full bg-foreground text-background hover:bg-foreground/90">Add Outcome</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {outcomes.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">No outcomes defined yet.</p> : (
                                <Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>#</TableHead><TableHead>Description</TableHead><TableHead>Attainment</TableHead></TableRow></TableHeader>
                                    <TableBody>{outcomes.map(o => (
                                        <TableRow key={o.id}><TableCell><Badge variant="outline">{o.type}</Badge></TableCell><TableCell>{o.number}</TableCell><TableCell className="max-w-md">{o.description}</TableCell><TableCell>{o.attainmentLevel ?? '-'}</TableCell></TableRow>
                                    ))}</TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Course Outcomes Tab */}
                <TabsContent value="cos">
                    <Card className="border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Course Outcomes</CardTitle>
                            <Dialog open={addCoOpen} onOpenChange={setAddCoOpen}>
                                <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" />Add CO</Button></DialogTrigger>
                                <DialogContent>
                                    <DialogHeader><DialogTitle>Add Course Outcome</DialogTitle></DialogHeader>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2"><Label>Course Code</Label><Input value={coForm.courseCode} onChange={e => setCoForm({ ...coForm, courseCode: e.target.value })} /></div>
                                            <div className="space-y-2"><Label>CO Number</Label><Input type="number" value={coForm.number} onChange={e => setCoForm({ ...coForm, number: Number(e.target.value) })} /></div>
                                        </div>
                                        <div className="space-y-2"><Label>Course Name</Label><Input value={coForm.courseName} onChange={e => setCoForm({ ...coForm, courseName: e.target.value })} /></div>
                                        <div className="space-y-2"><Label>Description</Label><Textarea value={coForm.description} onChange={e => setCoForm({ ...coForm, description: e.target.value })} /></div>
                                        <Button onClick={addCourseOutcome} className="w-full bg-foreground text-background hover:bg-foreground/90">Add CO</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardHeader>
                        <CardContent>
                            {cos.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">No course outcomes defined yet.</p> : (
                                <Table><TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Course</TableHead><TableHead>CO#</TableHead><TableHead>Description</TableHead></TableRow></TableHeader>
                                    <TableBody>{cos.map(c => (
                                        <TableRow key={c.id}><TableCell>{c.courseCode}</TableCell><TableCell>{c.courseName}</TableCell><TableCell>{c.number}</TableCell><TableCell className="max-w-md">{c.description}</TableCell></TableRow>
                                    ))}</TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CO-PO Matrix Tab */}
                <TabsContent value="matrix">
                    <Card className="border-border/50">
                        <CardHeader><CardTitle>CO-PO Mapping Matrix</CardTitle></CardHeader>
                        <CardContent>
                            {matrix ? (
                                <div className="overflow-x-auto">
                                    <pre className="text-xs bg-muted/30 p-4 rounded-lg">{JSON.stringify(matrix, null, 2)}</pre>
                                </div>
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-8">No mapping data available. Add POs and COs first, then create mappings.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Attainment Tab */}
                <TabsContent value="attainment">
                    <Card className="border-border/50">
                        <CardHeader><CardTitle>Attainment Summary</CardTitle></CardHeader>
                        <CardContent>
                            {attainment ? (
                                <div className="overflow-x-auto">
                                    <pre className="text-xs bg-muted/30 p-4 rounded-lg">{JSON.stringify(attainment, null, 2)}</pre>
                                </div>
                            ) : (
                                <p className="text-center text-sm text-muted-foreground py-8">Attainment data will appear once CO-PO mappings and assessment data are available.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
