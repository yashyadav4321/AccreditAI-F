'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import nbaService from '@/lib/services/nbaService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Calculator, Save, Loader2, Plus, Trash2,
    Target, CheckCircle, XCircle, Settings2,
} from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

interface AttainmentData {
    id: string;
    courseOutcomeId: string;
    type: string;
    label: string;
    totalStudents: number;
    studentsAbove: number;
    threshold: number;
    attainmentValue: number | null;
    academicYear?: string;
}

interface CoAttainment {
    id: string;
    courseCode: string;
    courseName: string;
    coNumber: number;
    description: string;
    directInternal: number | null;
    directExternal: number | null;
    indirect: number | null;
    directAttainment: number | null;
    finalAttainment: number | null;
    data: AttainmentData[];
}

interface PoAttainment {
    id: string;
    number: number;
    type: string;
    description: string;
    attainment: number | null;
    target: number | null;
    met: boolean | null;
}

interface Config {
    id: string;
    programId: string;
    directWeightage: number;
    indirectWeightage: number;
    internalWeightage: number;
    externalWeightage: number;
    targetLevel: number;
}

interface FullAttainment {
    config: Config;
    courseOutcomes: CoAttainment[];
    poAttainments: PoAttainment[];
    psoAttainments: PoAttainment[];
    summary: {
        avgPoAttainment: number;
        avgPsoAttainment: number;
        posMetTarget: number;
        totalPos: number;
        psosMetTarget: number;
        totalPsos: number;
    };
}

export default function AttainmentCalculatorPage() {
    const params = useParams();
    const programId = params.programId as string;
    const [data, setData] = useState<FullAttainment | null>(null);
    const [loading, setLoading] = useState(true);
    const [showConfig, setShowConfig] = useState(false);
    const [configForm, setConfigForm] = useState({ directWeightage: 0.8, indirectWeightage: 0.2, internalWeightage: 0.4, externalWeightage: 0.6, targetLevel: 2.0 });
    const [savingConfig, setSavingConfig] = useState(false);
    const [addingTo, setAddingTo] = useState<string | null>(null);
    const [newEntry, setNewEntry] = useState({ type: 'DIRECT_INTERNAL', label: '', totalStudents: 0, studentsAbove: 0, threshold: 60 });
    const [addingSaving, setAddingSaving] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await nbaService.getFullAttainment(programId);
            const d = res.data as unknown as Record<string, unknown>;
            const result = (d.data || res.data) as unknown as FullAttainment;
            setData(result);
            if (result.config) {
                setConfigForm({
                    directWeightage: result.config.directWeightage,
                    indirectWeightage: result.config.indirectWeightage,
                    internalWeightage: result.config.internalWeightage,
                    externalWeightage: result.config.externalWeightage,
                    targetLevel: result.config.targetLevel,
                });
            }
        } catch {
            toast.error('Failed to load attainment data');
        } finally {
            setLoading(false);
        }
    }, [programId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSaveConfig = async () => {
        setSavingConfig(true);
        try {
            await nbaService.saveAttainmentConfig(programId, configForm);
            toast.success('Configuration saved');
            setShowConfig(false);
            fetchData();
        } catch {
            toast.error('Failed to save');
        } finally {
            setSavingConfig(false);
        }
    };

    const handleAddEntry = async (courseOutcomeId: string) => {
        if (!newEntry.label) { toast.error('Label is required'); return; }
        setAddingSaving(true);
        try {
            await nbaService.addAttainmentData({ ...newEntry, courseOutcomeId });
            toast.success('Entry added');
            setAddingTo(null);
            setNewEntry({ type: 'DIRECT_INTERNAL', label: '', totalStudents: 0, studentsAbove: 0, threshold: 60 });
            fetchData();
        } catch {
            toast.error('Failed to add');
        } finally {
            setAddingSaving(false);
        }
    };

    const handleDeleteEntry = async (id: string) => {
        try {
            await nbaService.deleteAttainmentData(id);
            toast.success('Deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!data) return <p>No data available</p>;

    const { summary: sum } = data;
    const poPerc = sum.totalPos > 0 ? (sum.posMetTarget / sum.totalPos) * 100 : 0;

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            {/* Header */}
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Calculator className="h-8 w-8" />
                        CO-PO-PSO Attainment
                    </h1>
                    <p className="text-muted-foreground mt-1">Calculate outcome attainment using direct &amp; indirect methods</p>
                </div>
                <Button variant="outline" onClick={() => setShowConfig(!showConfig)}>
                    <Settings2 className="h-4 w-4 mr-2" />
                    Config
                </Button>
            </motion.div>

            {/* Summary Cards */}
            <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold">{sum.avgPoAttainment}</p>
                        <p className="text-sm text-muted-foreground">Avg PO Attainment</p>
                        <Progress value={(sum.avgPoAttainment / 3) * 100} className="h-2 mt-2" />
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold">{sum.avgPsoAttainment}</p>
                        <p className="text-sm text-muted-foreground">Avg PSO Attainment</p>
                        <Progress value={(sum.avgPsoAttainment / 3) * 100} className="h-2 mt-2" />
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-emerald-500">{sum.posMetTarget}/{sum.totalPos}</p>
                        <p className="text-sm text-muted-foreground">POs Met Target</p>
                        <Progress value={poPerc} className="h-2 mt-2" />
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-500">{sum.psosMetTarget}/{sum.totalPsos}</p>
                        <p className="text-sm text-muted-foreground">PSOs Met Target</p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Config Panel */}
            {showConfig && (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader><CardTitle className="text-lg">Weightage Configuration</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[
                                    { key: 'directWeightage' as const, label: 'Direct Weight' },
                                    { key: 'indirectWeightage' as const, label: 'Indirect Weight' },
                                    { key: 'internalWeightage' as const, label: 'Internal Weight' },
                                    { key: 'externalWeightage' as const, label: 'External Weight' },
                                    { key: 'targetLevel' as const, label: 'Target Level (0-3)' },
                                ].map(({ key, label }) => (
                                    <div key={key} className="space-y-2">
                                        <Label className="text-xs">{label}</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            value={configForm[key]}
                                            onChange={(e) => setConfigForm({ ...configForm, [key]: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                ))}
                            </div>
                            <Button className="mt-4" onClick={handleSaveConfig} disabled={savingConfig}>
                                {savingConfig ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Config
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* PO/PSO Attainment Table */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5" /> PO/PSO Attainment</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-border/50">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Type</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Attainment</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Target</th>
                                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...data.poAttainments, ...data.psoAttainments].map((po) => (
                                        <tr key={po.id} className="border-b border-border/30 hover:bg-muted/30">
                                            <td className="py-3 px-4 font-mono font-bold">{po.type}{po.number}</td>
                                            <td className="py-3 px-4"><Badge variant="outline">{po.type}</Badge></td>
                                            <td className="py-3 px-4 max-w-[300px] truncate">{po.description}</td>
                                            <td className="py-3 px-4 text-center font-bold">{po.attainment !== null ? po.attainment.toFixed(2) : '—'}</td>
                                            <td className="py-3 px-4 text-center">{po.target !== null ? po.target.toFixed(2) : '—'}</td>
                                            <td className="py-3 px-4 text-center">
                                                {po.met === true && <CheckCircle className="h-5 w-5 text-emerald-500 inline" />}
                                                {po.met === false && <XCircle className="h-5 w-5 text-red-500 inline" />}
                                                {po.met === null && <span className="text-muted-foreground">—</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* CO Attainment Details */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="text-lg">Course Outcome Attainment</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {data.courseOutcomes.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No course outcomes defined. Add COs from the program page first.</p>
                        ) : data.courseOutcomes.map((co) => (
                            <Card key={co.id} className="border-border/30">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="font-mono">{co.courseCode} CO{co.coNumber}</Badge>
                                            <span className="text-sm font-medium">{co.courseName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            {co.directInternal !== null && <span>Int: <strong>{co.directInternal.toFixed(2)}</strong></span>}
                                            {co.directExternal !== null && <span>Ext: <strong>{co.directExternal.toFixed(2)}</strong></span>}
                                            {co.indirect !== null && <span>Ind: <strong>{co.indirect.toFixed(2)}</strong></span>}
                                            <Badge className={co.finalAttainment !== null && co.finalAttainment >= configForm.targetLevel ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}>
                                                Final: {co.finalAttainment !== null ? co.finalAttainment.toFixed(2) : '—'}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Data entries table */}
                                    {co.data.length > 0 && (
                                        <table className="w-full text-xs mb-3">
                                            <thead>
                                                <tr className="border-b border-border/30">
                                                    <th className="text-left py-2 px-2">Type</th>
                                                    <th className="text-left py-2 px-2">Label</th>
                                                    <th className="text-center py-2 px-2">Total</th>
                                                    <th className="text-center py-2 px-2">Above</th>
                                                    <th className="text-center py-2 px-2">Attainment</th>
                                                    <th className="text-center py-2 px-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {co.data.map((d) => (
                                                    <tr key={d.id} className="border-b border-border/20">
                                                        <td className="py-2 px-2"><Badge variant="outline" className="text-[10px]">{d.type.replace('_', ' ')}</Badge></td>
                                                        <td className="py-2 px-2">{d.label}</td>
                                                        <td className="py-2 px-2 text-center">{d.totalStudents}</td>
                                                        <td className="py-2 px-2 text-center">{d.studentsAbove}</td>
                                                        <td className="py-2 px-2 text-center font-bold">{d.attainmentValue?.toFixed(2) || '—'}</td>
                                                        <td className="py-2 px-2 text-center">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => handleDeleteEntry(d.id)}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {/* Add entry form */}
                                    {addingTo === co.id ? (
                                        <div className="flex items-end gap-2 flex-wrap bg-muted/30 p-3 rounded-lg">
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Type</Label>
                                                <select value={newEntry.type} onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value })} className="px-2 py-1.5 rounded border border-input bg-background text-xs w-[140px]">
                                                    <option value="DIRECT_INTERNAL">Direct Internal</option>
                                                    <option value="DIRECT_EXTERNAL">Direct External</option>
                                                    <option value="INDIRECT_SURVEY">Indirect Survey</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Label</Label>
                                                <Input className="h-8 text-xs w-24" placeholder="IA-1" value={newEntry.label} onChange={(e) => setNewEntry({ ...newEntry, label: e.target.value })} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Total</Label>
                                                <Input className="h-8 text-xs w-16" type="number" value={newEntry.totalStudents} onChange={(e) => setNewEntry({ ...newEntry, totalStudents: parseInt(e.target.value) || 0 })} />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Above</Label>
                                                <Input className="h-8 text-xs w-16" type="number" value={newEntry.studentsAbove} onChange={(e) => setNewEntry({ ...newEntry, studentsAbove: parseInt(e.target.value) || 0 })} />
                                            </div>
                                            <Button size="sm" className="h-8" onClick={() => handleAddEntry(co.id)} disabled={addingSaving}>
                                                {addingSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8" onClick={() => setAddingTo(null)}>Cancel</Button>
                                        </div>
                                    ) : (
                                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setAddingTo(co.id)}>
                                            <Plus className="h-3 w-3 mr-1" /> Add Entry
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
