'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileBarChart, Save, Download, Send, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { iqacService, Aqar } from '@/lib/services/iqacService';

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => `${currentYear - i}-${currentYear - i + 1}`);

export default function AqarBuilderPage() {
    const [aqar, setAqar] = useState<Aqar | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedYear, setSelectedYear] = useState(yearOptions[0]);
    const [expandedSections, setExpandedSections] = useState<string[]>(['partA']);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await iqacService.generateAqar(selectedYear);
            setAqar(res.data.data);
            toast.success('AQAR generated with pre-filled data from NAAC, NBA, and NIRF modules');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to generate AQAR');
        } finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!aqar) return;
        setSaving(true);
        try {
            const res = await iqacService.updateAqar(aqar.id, {
                partA: aqar.partA,
                partB: aqar.partB,
                partC: aqar.partC,
            });
            setAqar(res.data.data);
            toast.success('AQAR saved');
        } catch { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    const handleFinalize = async () => {
        if (!aqar) return;
        if (!confirm('Are you sure you want to finalize this AQAR? This cannot be undone.')) return;
        try {
            const res = await iqacService.updateAqar(aqar.id, { status: 'FINALIZED' });
            setAqar(res.data.data);
            toast.success('AQAR finalized');
        } catch { toast.error('Failed to finalize'); }
    };

    const updatePartA = (key: string, value: any) => {
        if (!aqar) return;
        setAqar({ ...aqar, partA: { ...aqar.partA, [key]: value } });
    };

    const updatePartC = (key: string, value: any) => {
        if (!aqar) return;
        setAqar({ ...aqar, partC: { ...aqar.partC, [key]: value } });
    };

    const partA = aqar?.partA || {};
    const partB = aqar?.partB || {};
    const partC = aqar?.partC || {};

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AQAR Builder</h1>
                        <p className="text-muted-foreground mt-1">Annual Quality Assurance Report — auto-populated from your accreditation data</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {aqar && (
                            <>
                                <Badge variant={aqar.status === 'FINALIZED' ? 'default' : 'outline'} className={aqar.status === 'FINALIZED' ? 'bg-emerald-500/20 text-emerald-400' : ''}>
                                    {aqar.status} • v{aqar.version}
                                </Badge>
                                <Button variant="outline" onClick={handleSave} disabled={saving || aqar.status === 'FINALIZED'}>
                                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}Save Draft
                                </Button>
                                <Button onClick={handleFinalize} disabled={aqar.status === 'FINALIZED'}>
                                    <Send className="h-4 w-4 mr-2" />Finalize
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            {!aqar ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <Card className="max-w-lg mx-auto mt-12">
                        <CardHeader className="text-center">
                            <FileBarChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                            <CardTitle>Generate a New AQAR</CardTitle>
                            <CardDescription>Select an academic year to auto-generate your AQAR from NAAC, NBA, and NIRF data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Academic Year</Label>
                                <Select value={selectedYear} onValueChange={setSelectedYear}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button className="w-full" onClick={handleGenerate} disabled={loading}>
                                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</> : <><FileBarChart className="h-4 w-4 mr-2" />Generate AQAR</>}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-4">
                    {/* Part A: College Details */}
                    <Card>
                        <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
                            <AccordionItem value="partA" className="border-none">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-blue-500/20 text-blue-400">Part A</Badge>
                                        <span className="font-semibold">College Details</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { key: 'collegeName', label: 'College Name' },
                                            { key: 'collegeCode', label: 'College Code' },
                                            { key: 'type', label: 'Type' },
                                            { key: 'location', label: 'Location' },
                                            { key: 'state', label: 'State' },
                                            { key: 'city', label: 'City' },
                                            { key: 'website', label: 'Website' },
                                            { key: 'affiliation', label: 'Affiliation' },
                                            { key: 'naacGrade', label: 'NAAC Grade' },
                                            { key: 'totalStudents', label: 'Total Students' },
                                            { key: 'totalFaculty', label: 'Total Faculty' },
                                            { key: 'totalDepartments', label: 'Total Departments' },
                                        ].map(f => (
                                            <div key={f.key} className="grid gap-1">
                                                <Label className="text-xs text-muted-foreground">{f.label}</Label>
                                                <Input
                                                    value={partA[f.key] || ''}
                                                    onChange={e => updatePartA(f.key, e.target.value)}
                                                    disabled={aqar.status === 'FINALIZED'}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </Card>

                    {/* Part B: Criteria */}
                    {[1, 2, 3, 4, 5, 6, 7].map(n => {
                        const criterion = partB[`criterion${n}`] || {};
                        return (
                            <Card key={n}>
                                <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
                                    <AccordionItem value={`criterion${n}`} className="border-none">
                                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-emerald-500/20 text-emerald-400">Criterion {n}</Badge>
                                                <span className="font-semibold">{criterion.title || `Criterion ${n}`}</span>
                                                <Badge variant="outline" className="ml-auto mr-4">{criterion.status || 'N/A'}</Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-6 pb-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm text-muted-foreground">Compliance Score:</span>
                                                    <Badge>{criterion.complianceScore || 0}%</Badge>
                                                </div>
                                                {criterion.subCriteria?.length > 0 && (
                                                    <div className="space-y-2 mt-3">
                                                        <p className="text-sm font-medium">Sub-Criteria</p>
                                                        {criterion.subCriteria.map((sc: any, i: number) => (
                                                            <div key={i} className="flex items-center justify-between py-2 px-3 rounded bg-muted/30">
                                                                <span className="text-sm">{sc.subNumber} — {sc.title}</span>
                                                                <Badge variant="outline">{sc.status}</Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </Card>
                        );
                    })}

                    {/* Part C: Future Plans */}
                    <Card>
                        <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
                            <AccordionItem value="partC" className="border-none">
                                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-purple-500/20 text-purple-400">Part C</Badge>
                                        <span className="font-semibold">Future Plans & Best Practices</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6">
                                    <div className="grid gap-4">
                                        {[
                                            { key: 'futurePlans', label: 'Future Plans of the Institution' },
                                            { key: 'qualityInitiatives', label: 'Quality Initiatives by IQAC' },
                                            { key: 'areasOfImprovement', label: 'Areas of Improvement' },
                                            { key: 'bestPractices', label: 'Best Practices' },
                                        ].map(f => (
                                            <div key={f.key} className="grid gap-1">
                                                <Label className="text-sm">{f.label}</Label>
                                                <Textarea
                                                    value={partC[f.key] || ''}
                                                    onChange={e => updatePartC(f.key, e.target.value)}
                                                    rows={4}
                                                    disabled={aqar.status === 'FINALIZED'}
                                                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
