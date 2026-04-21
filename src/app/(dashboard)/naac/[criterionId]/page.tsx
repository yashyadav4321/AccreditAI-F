'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import naacService, { NaacCriterion, NaacDocumentAnalysisResult } from '@/lib/services/naacService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Brain, Loader2, Upload, CheckCircle2, X, Award, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { MarksMatrix } from '@/components/naac/MarksMatrix';

// Sub-criteria catalogue (mirrored from AI service)
const ALL_SUB_CRITERIA = [
    { subNumber: '1.1.1', title: 'Curriculum planning and implementation', maxMarks: 20, criterion: 1 },
    { subNumber: '1.1.2', title: 'Academic flexibility available', maxMarks: 20, criterion: 1 },
    { subNumber: '1.2.1', title: 'Programs with CBCS/Elective option', maxMarks: 20, criterion: 1 },
    { subNumber: '1.2.2', title: 'Value-added courses offered', maxMarks: 20, criterion: 1 },
    { subNumber: '1.3.1', title: 'Cross-cutting issues in curriculum', maxMarks: 20, criterion: 1 },
    { subNumber: '1.3.2', title: 'Courses integrating ICT', maxMarks: 10, criterion: 1 },
    { subNumber: '1.4.1', title: 'Structured feedback on curriculum', maxMarks: 20, criterion: 1 },
    { subNumber: '1.4.2', title: 'Feedback processes and action taken', maxMarks: 20, criterion: 1 },
    { subNumber: '2.1.1', title: 'Student enrollment and demand ratio', maxMarks: 20, criterion: 2 },
    { subNumber: '2.1.2', title: 'Reserved category admissions', maxMarks: 10, criterion: 2 },
    { subNumber: '2.2.1', title: 'Student-teacher ratio assessment', maxMarks: 20, criterion: 2 },
    { subNumber: '2.3.1', title: 'Student-centric methods adopted', maxMarks: 20, criterion: 2 },
    { subNumber: '2.3.2', title: 'ICT-enabled tools for teaching', maxMarks: 10, criterion: 2 },
    { subNumber: '2.4.1', title: 'Full-time teacher qualifications', maxMarks: 20, criterion: 2 },
    { subNumber: '2.4.2', title: 'Faculty with PhD percentage', maxMarks: 20, criterion: 2 },
    { subNumber: '2.5.1', title: 'Evaluation reforms implemented', maxMarks: 20, criterion: 2 },
    { subNumber: '2.6.1', title: 'Program and course outcomes defined', maxMarks: 20, criterion: 2 },
    { subNumber: '2.6.2', title: 'Attainment of outcomes measured', maxMarks: 20, criterion: 2 },
    { subNumber: '2.7.1', title: 'Student satisfaction survey results', maxMarks: 20, criterion: 2 },
    { subNumber: '3.1.1', title: 'Research grants and funding received', maxMarks: 15, criterion: 3 },
    { subNumber: '3.1.2', title: 'Teachers recognized as research guides', maxMarks: 10, criterion: 3 },
    { subNumber: '3.2.1', title: 'Innovation ecosystem and initiatives', maxMarks: 15, criterion: 3 },
    { subNumber: '3.2.2', title: 'Workshops/seminars on research methodology', maxMarks: 10, criterion: 3 },
    { subNumber: '3.3.1', title: 'Research papers in indexed journals', maxMarks: 20, criterion: 3 },
    { subNumber: '3.3.2', title: 'Books and chapters published', maxMarks: 15, criterion: 3 },
    { subNumber: '3.4.1', title: 'Extension activities conducted', maxMarks: 20, criterion: 3 },
    { subNumber: '3.4.2', title: 'Awards for extension activities', maxMarks: 15, criterion: 3 },
    { subNumber: '3.5.1', title: 'Collaborative activities with other institutions', maxMarks: 15, criterion: 3 },
    { subNumber: '3.5.2', title: 'MoUs and functional linkages', maxMarks: 15, criterion: 3 },
    { subNumber: '4.1.1', title: 'Physical infrastructure adequacy', maxMarks: 20, criterion: 4 },
    { subNumber: '4.1.2', title: 'Infrastructure augmentation expenditure', maxMarks: 15, criterion: 4 },
    { subNumber: '4.2.1', title: 'Library automation and resources', maxMarks: 15, criterion: 4 },
    { subNumber: '4.2.2', title: 'E-resources subscription and usage', maxMarks: 10, criterion: 4 },
    { subNumber: '4.3.1', title: 'IT infrastructure and internet bandwidth', maxMarks: 15, criterion: 4 },
    { subNumber: '4.3.2', title: 'Student-computer ratio', maxMarks: 10, criterion: 4 },
    { subNumber: '4.4.1', title: 'Infrastructure maintenance expenditure', maxMarks: 10, criterion: 4 },
    { subNumber: '4.4.2', title: 'Systems for maintenance and utilization', maxMarks: 5, criterion: 4 },
    { subNumber: '5.1.1', title: 'Scholarships and freeships provided', maxMarks: 15, criterion: 5 },
    { subNumber: '5.1.2', title: 'Capability enhancement and development schemes', maxMarks: 10, criterion: 5 },
    { subNumber: '5.1.3', title: 'Career counselling activities', maxMarks: 10, criterion: 5 },
    { subNumber: '5.2.1', title: 'Student placement statistics', maxMarks: 20, criterion: 5 },
    { subNumber: '5.2.2', title: 'Students qualifying state/national exams', maxMarks: 10, criterion: 5 },
    { subNumber: '5.3.1', title: 'Awards and medals in sports/cultural activities', maxMarks: 10, criterion: 5 },
    { subNumber: '5.3.2', title: 'Student council and representation', maxMarks: 10, criterion: 5 },
    { subNumber: '5.4.1', title: 'Alumni association activities', maxMarks: 10, criterion: 5 },
    { subNumber: '5.4.2', title: 'Alumni contribution to development', maxMarks: 5, criterion: 5 },
    { subNumber: '6.1.1', title: 'Institutional vision and leadership', maxMarks: 15, criterion: 6 },
    { subNumber: '6.1.2', title: 'Decentralization and participative management', maxMarks: 10, criterion: 6 },
    { subNumber: '6.2.1', title: 'Strategic plan and deployment', maxMarks: 15, criterion: 6 },
    { subNumber: '6.2.2', title: 'Institutional organization structure', maxMarks: 10, criterion: 6 },
    { subNumber: '6.3.1', title: 'Faculty empowerment strategies', maxMarks: 10, criterion: 6 },
    { subNumber: '6.3.2', title: 'Financial management and resource mobilization', maxMarks: 10, criterion: 6 },
    { subNumber: '6.4.1', title: 'Institution conducts internal and external audits', maxMarks: 10, criterion: 6 },
    { subNumber: '6.5.1', title: 'Internal Quality Assurance System', maxMarks: 10, criterion: 6 },
    { subNumber: '6.5.2', title: 'Quality initiatives by IQAC', maxMarks: 10, criterion: 6 },
    { subNumber: '7.1.1', title: 'Gender equity measures', maxMarks: 15, criterion: 7 },
    { subNumber: '7.1.2', title: 'Environmental consciousness and sustainability', maxMarks: 15, criterion: 7 },
    { subNumber: '7.1.3', title: 'Disabled-friendly and barrier-free environment', maxMarks: 10, criterion: 7 },
    { subNumber: '7.1.4', title: 'Code of conduct and institutional values', maxMarks: 10, criterion: 7 },
    { subNumber: '7.2.1', title: 'Best practices implemented', maxMarks: 25, criterion: 7 },
    { subNumber: '7.3.1', title: 'Institutional distinctiveness', maxMarks: 25, criterion: 7 },
];

type SubState = { loading: boolean; result: NaacDocumentAnalysisResult | null };

export default function NaacCriterionPage() {
    const params = useParams();
    const criterionId = params.criterionId as string;
    const [criterion, setCriterion] = useState<NaacCriterion | null>(null);
    const [loading, setLoading] = useState(true);

    // Per-sub-criterion analysis state
    const [subStates, setSubStates] = useState<Record<string, SubState>>({});
    const subFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

    // Criteria-level upload (all sub-criteria of this criterion at once)
    const [criteriaLoading, setCriteriaLoading] = useState(false);
    const [criteriaResult, setCriteriaResult] = useState<NaacDocumentAnalysisResult | null>(null);
    const criteriaFileRef = useRef<HTMLInputElement | null>(null);

    const fetchCriterion = useCallback(async () => {
        try {
            const res = await naacService.getCriterionById(criterionId);
            const d = res.data as unknown as Record<string, unknown>;
            setCriterion((d.data as NaacCriterion) || (res.data as NaacCriterion));
        } catch { toast.error('Failed to load criterion'); } finally { setLoading(false); }
    }, [criterionId]);

    useEffect(() => { fetchCriterion(); }, [fetchCriterion]);

    const criterionNumber: number = (criterion as any)?.criterionNumber || 0;
    const subCriteriaForThis = ALL_SUB_CRITERIA.filter(s => s.criterion === criterionNumber);

    // Upload all files for this criterion (scoped to criterion) — async polling
    const handleCriteriaUpload = async (files: FileList) => {
        if (files.length > 30) { toast.error('Maximum 30 files.'); return; }
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) formData.append('files', files[i]);

        setCriteriaLoading(true);
        setCriteriaResult(null);
        try {
            const res = await naacService.analyzeDocuments(formData, { criterionNumber });
            const d = res.data as unknown as Record<string, unknown>;
            const payload = (d.data as { reportId: string }) || (res.data as unknown as { reportId: string });
            toast.info(`Files uploaded. AI is analysing criterion ${criterionNumber}...`);
            const result = await naacService.pollForResult(payload.reportId);
            setCriteriaResult(result);
            toast.success('Criterion analysis complete! Saved automatically.');
        } catch (err: any) { toast.error(err?.message || 'Analysis failed. Please try again.'); } finally {
            setCriteriaLoading(false);
            if (criteriaFileRef.current) criteriaFileRef.current.value = '';
        }
    };

    // Upload files for a single sub-criterion — async polling
    const handleSubUpload = async (subNumber: string, files: FileList) => {
        if (files.length > 5) { toast.error('Maximum 5 files per sub-criterion.'); return; }
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) formData.append('files', files[i]);

        setSubStates(prev => ({ ...prev, [subNumber]: { loading: true, result: null } }));
        try {
            const res = await naacService.analyzeDocuments(formData, { subCriterionNumbers: [subNumber] });
            const d = res.data as unknown as Record<string, unknown>;
            const payload = (d.data as { reportId: string }) || (res.data as unknown as { reportId: string });
            toast.info(`Files uploaded. AI is analysing ${subNumber}...`);
            const result = await naacService.pollForResult(payload.reportId);
            setSubStates(prev => ({ ...prev, [subNumber]: { loading: false, result } }));
            toast.success(`${subNumber} analysed & saved!`);
        } catch (err: any) {
            setSubStates(prev => ({ ...prev, [subNumber]: { loading: false, result: null } }));
            toast.error(err?.message || 'Analysis failed.');
        }
        const ref = subFileRefs.current[subNumber];
        if (ref) ref.value = '';
    };

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;

    const cTitle = (criterion as any)?.title || criterion?.name || 'Criterion';
    const cDesc = criterion?.description || '';

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    {criterionNumber > 0 && <Badge className="mb-2">Criterion {criterionNumber}</Badge>}
                    <h1 className="text-3xl font-bold">{cTitle}</h1>
                    {cDesc && <p className="text-muted-foreground mt-1">{cDesc}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                    {/* Whole-criterion upload */}
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.docx,.doc,.txt"
                        className="hidden"
                        ref={criteriaFileRef}
                        onChange={e => { if (e.target.files?.length) handleCriteriaUpload(e.target.files); }}
                    />
                    <Button
                        onClick={() => criteriaFileRef.current?.click()}
                        disabled={criteriaLoading}
                        className="bg-foreground text-background hover:bg-foreground/90"
                    >
                        {criteriaLoading
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analysing...</>
                            : <><Brain className="mr-2 h-4 w-4" />Analyse Whole Criterion (max 30)</>
                        }
                    </Button>
                </div>
            </div>

            {/* Whole-criterion result */}
            <AnimatePresence>
                {criteriaResult && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                <CheckCircle2 className="h-4 w-4" />
                                Criterion-level analysis — auto-saved
                            </div>
                            <button onClick={() => setCriteriaResult(null)} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <MarksMatrix result={criteriaResult} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sub-criteria List */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold">Sub-Criteria</h2>
                    <span className="text-sm text-muted-foreground">— upload up to 5 files per sub-criterion</span>
                </div>

                {subCriteriaForThis.length === 0 ? (
                    <Card className="border-border/50">
                        <CardContent className="p-10 text-center text-muted-foreground text-sm">
                            Sub-criteria not available. The criterion number could not be determined.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {subCriteriaForThis.map(sc => {
                            const state = subStates[sc.subNumber];
                            const isLoading = state?.loading;
                            const result = state?.result;

                            return (
                                <div key={sc.subNumber} className="space-y-2">
                                    <Card className="border-border/50 hover:border-border transition-colors">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                {/* Sub-criterion info */}
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <span className="text-xs font-mono font-bold bg-muted px-2 py-1 rounded shrink-0">
                                                        {sc.subNumber}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-sm truncate">{sc.title}</p>
                                                        <p className="text-xs text-muted-foreground">Max {sc.maxMarks} marks</p>
                                                    </div>
                                                </div>

                                                {/* Action area */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {result ? (
                                                        <>
                                                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                                <CheckCircle2 className="h-3.5 w-3.5" />
                                                                <span>{result.overallEstimatedScore} / {result.maxPossibleScore}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => setSubStates(prev => { const n = { ...prev }; delete n[sc.subNumber]; return n; })}
                                                                className="text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                accept=".pdf,.docx,.doc,.txt"
                                                                className="hidden"
                                                                ref={el => { subFileRefs.current[sc.subNumber] = el; }}
                                                                onChange={e => {
                                                                    if (e.target.files?.length) handleSubUpload(sc.subNumber, e.target.files);
                                                                }}
                                                            />
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={isLoading}
                                                                onClick={() => subFileRefs.current[sc.subNumber]?.click()}
                                                            >
                                                                {isLoading ? (
                                                                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Analysing...</>
                                                                ) : (
                                                                    <><Upload className="mr-1.5 h-3.5 w-3.5" />Upload (max 5)</>
                                                                )}
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Inline results */}
                                    <AnimatePresence>
                                        {result && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="pl-4 border-l-2 border-emerald-500/30"
                                            >
                                                <MarksMatrix result={result} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
