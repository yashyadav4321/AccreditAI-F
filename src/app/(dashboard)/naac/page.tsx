'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import naacService, { NaacCriterion, ComplianceSummary, NaacDocumentAnalysisResult } from '@/lib/services/naacService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BarChart3, Loader2, Sparkles, Upload, Brain, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { MarksMatrix } from '@/components/naac/MarksMatrix';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const CRITERION_COLORS = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-violet-600',
    'from-pink-500 to-pink-600',
    'from-amber-500 to-amber-600',
    'from-emerald-500 to-emerald-600',
    'from-cyan-500 to-cyan-600',
    'from-rose-500 to-rose-600',
];

const CRITERION_LABELS = [
    { number: 1, title: 'Curricular Aspects', maxMarks: 150 },
    { number: 2, title: 'Teaching-Learning and Evaluation', maxMarks: 200 },
    { number: 3, title: 'Research, Innovations and Extension', maxMarks: 150 },
    { number: 4, title: 'Infrastructure and Learning Resources', maxMarks: 100 },
    { number: 5, title: 'Student Support and Progression', maxMarks: 100 },
    { number: 6, title: 'Governance, Leadership and Management', maxMarks: 100 },
    { number: 7, title: 'Institutional Values and Best Practices', maxMarks: 100 },
];

// All NAAC sub-criteria mirrored from the AI service
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

type AnalysisState = {
    loading: boolean;
    result: NaacDocumentAnalysisResult | null;
};

export default function NaacPage() {
    const [criteria, setCriteria] = useState<NaacCriterion[]>([]);
    const [summary, setSummary] = useState<ComplianceSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);
    const [activeTab, setActiveTab] = useState<'criteria' | 'sub-criteria'>('criteria');

    // Per-criterion analysis state (criteria-wise tab)
    const [criteriaAnalysis, setCriteriaAnalysis] = useState<Record<number, AnalysisState>>({});

    // Per-sub-criterion analysis state (sub-criteria tab)
    const [subAnalysis, setSubAnalysis] = useState<Record<string, AnalysisState>>({});

    // Hidden file inputs: one per criterion (1-7) and one per sub-criterion
    const criteriaFileRefs = useRef<Record<number, HTMLInputElement | null>>({});
    const subFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

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

    // Criteria-wise upload handler (async polling)
    const handleCriteriaUpload = async (criterionNumber: number, files: FileList) => {
        if (files.length > 30) {
            toast.error('Maximum 30 files per criterion.');
            return;
        }
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) formData.append('files', files[i]);

        setCriteriaAnalysis(prev => ({ ...prev, [criterionNumber]: { loading: true, result: null } }));
        try {
            // 1. Upload files — returns reportId immediately
            const res = await naacService.analyzeDocuments(formData, { criterionNumber });
            const d = res.data as unknown as Record<string, unknown>;
            const payload = (d.data as { reportId: string }) || (res.data as unknown as { reportId: string });
            const reportId = payload.reportId;

            toast.info(`Files uploaded. AI is analysing criterion ${criterionNumber}...`);

            // 2. Poll for the result every 5 seconds
            const result = await naacService.pollForResult(reportId);
            setCriteriaAnalysis(prev => ({ ...prev, [criterionNumber]: { loading: false, result } }));
            toast.success(`Criterion ${criterionNumber} analysis complete! Saved automatically.`);
        } catch (error: any) {
            console.error('[handleCriteriaUpload] Analysis failed:', error);
            setCriteriaAnalysis(prev => ({ ...prev, [criterionNumber]: { loading: false, result: null } }));
            toast.error(error?.message || 'Analysis failed. Please try again.');
        }
        // Reset file input
        const ref = criteriaFileRefs.current[criterionNumber];
        if (ref) ref.value = '';
    };

    // Sub-criterion upload handler (async polling)
    const handleSubUpload = async (subNumber: string, files: FileList) => {
        if (files.length > 5) {
            toast.error('Maximum 5 files per sub-criterion.');
            return;
        }
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) formData.append('files', files[i]);

        setSubAnalysis(prev => ({ ...prev, [subNumber]: { loading: true, result: null } }));
        try {
            // 1. Upload files — returns reportId immediately
            const res = await naacService.analyzeDocuments(formData, { subCriterionNumbers: [subNumber] });
            const d = res.data as unknown as Record<string, unknown>;
            const payload = (d.data as { reportId: string }) || (res.data as unknown as { reportId: string });
            const reportId = payload.reportId;

            toast.info(`Files uploaded. AI is analysing ${subNumber}...`);

            // 2. Poll for the result every 5 seconds
            const result = await naacService.pollForResult(reportId);
            setSubAnalysis(prev => ({ ...prev, [subNumber]: { loading: false, result } }));
            toast.success(`${subNumber} analysis complete! Saved automatically.`);
        } catch (error: any) {
            console.error('[handleSubUpload] Analysis failed:', error);
            setSubAnalysis(prev => ({ ...prev, [subNumber]: { loading: false, result: null } }));
            toast.error(error?.message || 'Analysis failed. Please try again.');
        }
        const ref = subFileRefs.current[subNumber];
        if (ref) ref.value = '';
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
            {/* Header */}
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">NAAC Accreditation</h1>
                    <p className="text-muted-foreground mt-1">Upload documents criterion-wise or sub-criterion-wise for AI analysis</p>
                </div>
                <Button onClick={handleInitialize} disabled={initializing} variant="outline">
                    {initializing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Initialize Sub-Criteria
                </Button>
            </motion.div>

            {/* Overall Compliance */}
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

            {/* Tab Toggle */}
            <motion.div variants={fadeIn}>
                <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('criteria')}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'criteria'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Upload className="inline h-4 w-4 mr-2" />
                        Criteria-wise Upload
                    </button>
                    <button
                        onClick={() => setActiveTab('sub-criteria')}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'sub-criteria'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Brain className="inline h-4 w-4 mr-2" />
                        Sub-Criteria-wise Upload
                    </button>
                </div>
            </motion.div>

            {/* ── Criteria-wise Tab ── */}
            <AnimatePresence mode="wait">
                {activeTab === 'criteria' && (
                    <motion.div
                        key="criteria"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4"
                    >
                        <p className="text-sm text-muted-foreground">
                            Upload up to <strong>30 files</strong> per criterion. The AI will analyse only that criterion's sub-criteria.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {CRITERION_LABELS.map((c, i) => {
                                const state = criteriaAnalysis[c.number];
                                const isLoading = state?.loading;
                                const result = state?.result;

                                return (
                                    <div key={c.number} className="space-y-3">
                                        {/* Criterion Upload Card */}
                                        <Card className="border-border/50 hover:border-border transition-colors">
                                            <CardContent className="p-5">
                                                <div className="flex items-start justify-between gap-3 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${CRITERION_COLORS[i]} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                                            {c.number}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm leading-tight">{c.title}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">Max {c.maxMarks} marks</p>
                                                        </div>
                                                    </div>
                                                    {result && (
                                                        <button
                                                            onClick={() => setCriteriaAnalysis(prev => { const n = { ...prev }; delete n[c.number]; return n; })}
                                                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>

                                                {result ? (
                                                    <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span className="font-medium">
                                                            Score: {result.overallEstimatedScore} / {result.maxPossibleScore}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Hidden file input */}
                                                        <input
                                                            type="file"
                                                            multiple
                                                            accept=".pdf,.docx,.doc,.txt"
                                                            className="hidden"
                                                            ref={el => { criteriaFileRefs.current[c.number] = el; }}
                                                            onChange={e => {
                                                                if (e.target.files?.length) handleCriteriaUpload(c.number, e.target.files);
                                                            }}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full"
                                                            disabled={isLoading}
                                                            onClick={() => criteriaFileRefs.current[c.number]?.click()}
                                                        >
                                                            {isLoading ? (
                                                                <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Analysing...</>
                                                            ) : (
                                                                <><Upload className="mr-2 h-3.5 w-3.5" />Upload &amp; Analyse (max 30)</>
                                                            )}
                                                        </Button>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Inline results */}
                                        {result && <MarksMatrix result={result} />}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ── Sub-Criteria-wise Tab ── */}
                {activeTab === 'sub-criteria' && (
                    <motion.div
                        key="sub-criteria"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-6"
                    >
                        <p className="text-sm text-muted-foreground">
                            Upload up to <strong>5 files</strong> per sub-criterion. The AI will analyse only that specific sub-criterion.
                        </p>
                        {CRITERION_LABELS.map((c, ci) => {
                            const subCriteria = ALL_SUB_CRITERIA.filter(s => s.criterion === c.number);
                            return (
                                <div key={c.number}>
                                    {/* Criterion header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${CRITERION_COLORS[ci]} flex items-center justify-center text-white font-bold text-sm`}>
                                            {c.number}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{c.title}</p>
                                            <p className="text-xs text-muted-foreground">{subCriteria.length} sub-criteria · Max {c.maxMarks} marks</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-11">
                                        {subCriteria.map(sc => {
                                            const state = subAnalysis[sc.subNumber];
                                            const isLoading = state?.loading;
                                            const result = state?.result;

                                            return (
                                                <div key={sc.subNumber} className="space-y-2">
                                                    <Card className="border-border/50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-mono font-bold bg-muted px-1.5 py-0.5 rounded shrink-0">
                                                                            {sc.subNumber}
                                                                        </span>
                                                                        <Badge variant="outline" className="text-[10px] shrink-0">
                                                                            max {sc.maxMarks}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm font-medium leading-snug">{sc.title}</p>
                                                                </div>
                                                                {result && (
                                                                    <button
                                                                        onClick={() => setSubAnalysis(prev => { const n = { ...prev }; delete n[sc.subNumber]; return n; })}
                                                                        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {result ? (
                                                                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                    <span className="font-medium">
                                                                        Score: {result.overallEstimatedScore} / {result.maxPossibleScore} — saved
                                                                    </span>
                                                                </div>
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
                                                                        className="w-full h-8 text-xs"
                                                                        disabled={isLoading}
                                                                        onClick={() => subFileRefs.current[sc.subNumber]?.click()}
                                                                    >
                                                                        {isLoading ? (
                                                                            <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Analysing...</>
                                                                        ) : (
                                                                            <><Upload className="mr-1.5 h-3 w-3" />Upload (max 5)</>
                                                                        )}
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                    {result && <MarksMatrix result={result} />}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {ci < CRITERION_LABELS.length - 1 && (
                                        <div className="border-t border-border/30 mt-6" />
                                    )}
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
