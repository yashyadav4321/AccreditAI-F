'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    BarChart3, Filter, MapPin, GraduationCap, Award,
    ChevronDown, ChevronUp, Building2, TrendingUp,
    FileText, Eye, BookOpen, Sparkles,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RTooltip, Legend, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import {
    BENCHMARK_COLLEGES, CRITERIA_DEFINITIONS,
    COLLEGE_CHART_COLORS, STREAM_COLORS, REGION_COLORS,
    filterColleges, mergeSSRData,
    type BenchmarkCollege, type Stream, type Region, type ComparisonMode,
} from '@/lib/data/benchmarkData';
import naacService from '@/lib/services/naacService';
import type { CriterionScoreSummary, BenchmarkSSRData } from '@/lib/services/naacService';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BenchmarkComparisonProps {
    /** The user's criterion scores from completed analyses */
    userScores: CriterionScoreSummary[];
    /** Name of the user's college (optional, falls back to "Your College") */
    collegeName?: string;
}

const STREAM_OPTIONS: ('All' | Stream)[] = ['All', 'Arts', 'Commerce', 'Science'];
const REGION_OPTIONS: ('All' | Region)[] = ['All', 'Tier 1', 'Tier 2', 'Tier 3'];
const USER_COLOR = '#22c55e'; // green for user's college

// ─── Component ───────────────────────────────────────────────────────────────

export function BenchmarkComparison({ userScores, collegeName }: BenchmarkComparisonProps) {
    const [streamFilter, setStreamFilter] = useState<'All' | Stream>('All');
    const [regionFilter, setRegionFilter] = useState<'All' | Region>('All');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [expanded, setExpanded] = useState(true);
    const [mode, setMode] = useState<ComparisonMode>('estimated');
    const [ssrData, setSSRData] = useState<BenchmarkSSRData[]>([]);
    const [ssrLoading, setSSRLoading] = useState(false);
    const [ssrAvailable, setSSRAvailable] = useState(false);
    const [evidenceCollegeId, setEvidenceCollegeId] = useState<string | null>(null);

    // Fetch SSR data on mount to check availability
    useEffect(() => {
        naacService.getBenchmarkData().then(res => {
            const d = (res.data as any)?.data || res.data;
            const payload = d?.data || d;
            if (Array.isArray(payload) && payload.length > 0) {
                setSSRData(payload);
                setSSRAvailable(true);
            }
        }).catch(() => { /* SSR data not available yet */ });
    }, []);

    // Active colleges list based on mode
    const activeColleges = useMemo(() => {
        if (mode === 'ssr' && ssrData.length > 0) {
            return mergeSSRData(ssrData);
        }
        return BENCHMARK_COLLEGES;
    }, [mode, ssrData]);

    const filteredColleges = useMemo(
        () => filterColleges(streamFilter, regionFilter, activeColleges),
        [streamFilter, regionFilter, activeColleges],
    );

    const selectedColleges = useMemo(
        () => activeColleges.filter(c => selectedIds.has(c.id)),
        [selectedIds, activeColleges],
    );

    const toggleCollege = (id: string) => {
        if (mode === 'ssr') {
            // Single-select in SSR mode — compare against one college at a time
            setSelectedIds(prev => {
                if (prev.has(id) && prev.size === 1) return new Set();
                return new Set([id]);
            });
            setEvidenceCollegeId(id);
        } else {
            // Multi-select in estimated/checklist mode
            setSelectedIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
        }
    };

    const handleModeChange = (newMode: ComparisonMode) => {
        setMode(newMode);
        setSelectedIds(new Set());
        setEvidenceCollegeId(null);
    };

    const selectAll = () => {
        if (mode === 'ssr') return; // No select-all in SSR mode
        setSelectedIds(new Set(filteredColleges.map(c => c.id)));
    };
    const clearAll = () => { setSelectedIds(new Set()); setEvidenceCollegeId(null); };

    const displayName = collegeName || 'Your College';

    // Build the user's score map  { criterionNumber -> score }
    const userScoreMap = useMemo(() => {
        const map: Record<number, number> = {};
        userScores.forEach(s => { map[s.criterionNumber] = s.estimatedMarks; });
        return map;
    }, [userScores]);

    // Radar data (% of max)
    const radarData = useMemo(() => {
        return CRITERIA_DEFINITIONS.map(def => {
            const entry: Record<string, string | number> = {
                criterion: `C${def.number}`,
                fullName: def.title,
            };
            // User's score
            const uScore = userScoreMap[def.number];
            entry['user'] = uScore != null ? Math.round((uScore / def.maxMarks) * 100) : 0;
            // Benchmark scores
            selectedColleges.forEach(c => {
                const cs = c.criteriaScores.find(s => s.criterionNumber === def.number);
                entry[c.id] = cs ? Math.round((cs.score / cs.maxMarks) * 100) : 0;
            });
            return entry;
        });
    }, [userScoreMap, selectedColleges]);

    // Bar data (absolute)
    const barData = useMemo(() => {
        return CRITERIA_DEFINITIONS.map(def => {
            const entry: Record<string, string | number> = {
                criterion: `C${def.number}`,
                fullName: def.title,
            };
            entry['user'] = userScoreMap[def.number] ?? 0;
            selectedColleges.forEach(c => {
                const cs = c.criteriaScores.find(s => s.criterionNumber === def.number);
                entry[c.id] = cs?.score ?? 0;
            });
            return entry;
        });
    }, [userScoreMap, selectedColleges]);

    // User total
    const userTotal = userScores.reduce((s, cs) => s + cs.estimatedMarks, 0);
    const userMax = userScores.reduce((s, cs) => s + cs.maxMarks, 0);

    const hasComparison = selectedColleges.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold">Compare with Benchmarks</h2>
                        <p className="text-xs text-muted-foreground">
                            {mode === 'ssr'
                                ? 'Comparing against real SSR document data from A++ colleges'
                                : 'Compare your scores against A++ accredited colleges'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Mode Toggle */}
                    {ssrAvailable && (
                        <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
                            <button
                                onClick={() => handleModeChange('estimated')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                                    mode === 'estimated'
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <BarChart3 className="h-3 w-3" />
                                NAAC Checklist
                            </button>
                            <button
                                onClick={() => handleModeChange('ssr')}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                                    mode === 'ssr'
                                        ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <FileText className="h-3 w-3" />
                                Real SSR Data
                                <Sparkles className="h-2.5 w-2.5" />
                            </button>
                        </div>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-4"
                    >
                        {/* Filters */}
                        <Card className="border-border/50">
                            <CardContent className="p-4">
                                <div className="flex flex-wrap items-end gap-4">
                                    {/* Stream */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                            <GraduationCap className="h-3 w-3" /> Stream
                                        </label>
                                        <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
                                            {STREAM_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setStreamFilter(opt)}
                                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                                        streamFilter === opt
                                                            ? 'bg-background text-foreground shadow-sm'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Region */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> Region
                                        </label>
                                        <div className="flex gap-0.5 p-0.5 bg-muted rounded-lg">
                                            {REGION_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setRegionFilter(opt)}
                                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                                        regionFilter === opt
                                                            ? 'bg-background text-foreground shadow-sm'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                    }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 ml-auto items-center">
                                        {mode === 'ssr' && (
                                            <span className="text-[10px] text-muted-foreground mr-1">Select one college to compare</span>
                                        )}
                                        {mode !== 'ssr' && (
                                            <Button size="sm" variant="outline" onClick={selectAll} className="h-7 text-xs">
                                                Select All
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" onClick={clearAll} className="h-7 text-xs">
                                            Clear
                                        </Button>
                                    </div>
                                </div>

                                {/* College picker grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 mt-4">
                                    {filteredColleges.map(college => {
                                        const isSelected = selectedIds.has(college.id);
                                        return (
                                            <div
                                                key={college.id}
                                                onClick={() => toggleCollege(college.id)}
                                                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'border-foreground/30 bg-accent/50'
                                                        : 'border-border/50 hover:border-border'
                                                }`}
                                            >
                                                <Checkbox checked={isSelected} className="shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold truncate">{college.name}</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <MapPin className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                                                        <span className="text-[10px] text-muted-foreground truncate">{college.city}</span>
                                                        {mode === 'ssr' && college.hasSSRData && (
                                                            <Badge className="text-[8px] px-1 py-0 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shrink-0">
                                                                SSR
                                                            </Badge>
                                                        )}
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[9px] px-1.5 py-0 ml-auto shrink-0"
                                                            style={{
                                                                borderColor: STREAM_COLORS[college.stream] + '60',
                                                                color: STREAM_COLORS[college.stream],
                                                            }}
                                                        >
                                                            {college.stream}
                                                        </Badge>
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[9px] px-1.5 py-0 shrink-0"
                                                            style={{
                                                                borderColor: REGION_COLORS[college.region] + '60',
                                                                color: REGION_COLORS[college.region],
                                                            }}
                                                        >
                                                            {college.region}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Comparison Charts — only if colleges are selected */}
                        {hasComparison && (
                            <div className="space-y-4">
                                {/* Charts row */}
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                    {/* Radar */}
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-1 pt-4 px-4">
                                            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                                                <TrendingUp className="h-3.5 w-3.5" />
                                                Performance Radar (% of Max)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-1">
                                            <ResponsiveContainer width="100%" height={320}>
                                                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="68%">
                                                    <PolarGrid stroke="var(--border)" />
                                                    <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: 'var(--muted-foreground)' }} />
                                                    {/* User's college — bold, on top */}
                                                    <Radar name={displayName} dataKey="user" stroke={USER_COLOR} fill={USER_COLOR} fillOpacity={0.15} strokeWidth={2.5} />
                                                    {selectedColleges.map(c => (
                                                        <Radar key={c.id} name={c.name} dataKey={c.id} stroke={COLLEGE_CHART_COLORS[c.id]} fill={COLLEGE_CHART_COLORS[c.id]} fillOpacity={0.05} strokeWidth={1.5} />
                                                    ))}
                                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                                                    <RTooltip
                                                        contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }}
                                                        formatter={(v: number) => [`${v}%`, '']}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>

                                    {/* Bar */}
                                    <Card className="border-border/50">
                                        <CardHeader className="pb-1 pt-4 px-4">
                                            <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                                                <BarChart3 className="h-3.5 w-3.5" />
                                                Criterion Scores (Absolute)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-1">
                                            <ResponsiveContainer width="100%" height={320}>
                                                <BarChart data={barData} layout="vertical" margin={{ left: 4, right: 12 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                                    <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
                                                    <YAxis type="category" dataKey="criterion" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={32} />
                                                    <Bar dataKey="user" name={displayName} fill={USER_COLOR} radius={[0, 4, 4, 0]} barSize={selectedColleges.length > 3 ? 5 : 8} />
                                                    {selectedColleges.map(c => (
                                                        <Bar key={c.id} dataKey={c.id} name={c.name} fill={COLLEGE_CHART_COLORS[c.id]} radius={[0, 4, 4, 0]} barSize={selectedColleges.length > 3 ? 5 : 8} />
                                                    ))}
                                                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                                                    <RTooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Summary Table */}
                                <Card className="border-border/50 overflow-hidden">
                                    <CardHeader className="pb-2 pt-3 px-4">
                                        <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                                            <Award className="h-3.5 w-3.5" />
                                            Score Comparison Table
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b border-border/50 bg-muted/30">
                                                        <th className="text-left px-3 py-2 font-semibold text-muted-foreground">Criterion</th>
                                                        <th className="text-center px-2 py-2 font-semibold text-muted-foreground">Max</th>
                                                        <th className="text-center px-2 py-2">
                                                            <span className="font-bold" style={{ color: USER_COLOR }}>{displayName}</span>
                                                        </th>
                                                        {selectedColleges.map(c => (
                                                            <th key={c.id} className="text-center px-2 py-2 whitespace-nowrap">
                                                                <div className="flex flex-col items-center">
                                                                    <span className="font-semibold" style={{ color: COLLEGE_CHART_COLORS[c.id] }}>{c.name}</span>
                                                                    <span className="text-[9px] text-muted-foreground">{c.city}</span>
                                                                </div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {CRITERIA_DEFINITIONS.map(def => {
                                                        const uScore = userScoreMap[def.number] ?? 0;
                                                        const uPct = Math.round((uScore / def.maxMarks) * 100);
                                                        return (
                                                            <tr key={def.number} className="border-b border-border/30 hover:bg-muted/20">
                                                                <td className="px-3 py-2 font-medium whitespace-nowrap">
                                                                    <span className="font-mono bg-muted px-1 py-0.5 rounded mr-1.5 text-[10px]">C{def.number}</span>
                                                                    {def.title}
                                                                </td>
                                                                <td className="text-center px-2 py-2 text-muted-foreground font-mono">{def.maxMarks}</td>
                                                                <td className="text-center px-2 py-2">
                                                                    <span className="font-bold" style={{ color: USER_COLOR }}>{uScore}</span>
                                                                    <span className="text-muted-foreground ml-0.5">({uPct}%)</span>
                                                                </td>
                                                                {selectedColleges.map(c => {
                                                                    const cs = c.criteriaScores.find(s => s.criterionNumber === def.number);
                                                                    const score = cs?.score ?? 0;
                                                                    const pct = Math.round((score / def.maxMarks) * 100);
                                                                    const diff = uScore - score;
                                                                    return (
                                                                        <td key={c.id} className="text-center px-2 py-2 whitespace-nowrap">
                                                                            <span className="font-bold" style={{ color: COLLEGE_CHART_COLORS[c.id] }}>{score}</span>
                                                                            <span className="text-muted-foreground ml-0.5">({pct}%)</span>
                                                                            {uScore > 0 && (
                                                                                <span className={`ml-1 text-[9px] font-semibold ${diff > 0 ? 'text-emerald-500' : diff < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                                                                                    {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '='}
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                    {/* Totals */}
                                                    <tr className="bg-muted/30 font-bold">
                                                        <td className="px-3 py-2">Total</td>
                                                        <td className="text-center px-2 py-2 text-muted-foreground font-mono">900</td>
                                                        <td className="text-center px-2 py-2" style={{ color: USER_COLOR }}>
                                                            {userTotal}
                                                            <span className="text-muted-foreground font-normal ml-0.5">({userMax > 0 ? Math.round((userTotal / userMax) * 100) : 0}%)</span>
                                                        </td>
                                                        {selectedColleges.map(c => {
                                                            const t = c.criteriaScores.reduce((s, cs) => s + cs.score, 0);
                                                            const m = c.criteriaScores.reduce((s, cs) => s + cs.maxMarks, 0);
                                                            return (
                                                                <td key={c.id} className="text-center px-2 py-2" style={{ color: COLLEGE_CHART_COLORS[c.id] }}>
                                                                    {t}
                                                                    <span className="text-muted-foreground font-normal ml-0.5">({Math.round((t / m) * 100)}%)</span>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* SSR Evidence Panel */}
                        {mode === 'ssr' && hasComparison && (
                            <Card className="border-border/50">
                                <CardHeader className="pb-2 pt-3 px-4">
                                    <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-muted-foreground">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        SSR Evidence &amp; Key Findings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="flex gap-1 mb-3 flex-wrap">
                                        {selectedColleges.filter(c => c.hasSSRData).map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => setEvidenceCollegeId(evidenceCollegeId === c.id ? null : c.id)}
                                                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all border ${
                                                    evidenceCollegeId === c.id
                                                        ? 'border-foreground/30 bg-accent'
                                                        : 'border-border/50 hover:border-border'
                                                }`}
                                                style={{ color: COLLEGE_CHART_COLORS[c.id] }}
                                            >
                                                {c.name}
                                            </button>
                                        ))}
                                    </div>
                                    {evidenceCollegeId && (() => {
                                        const college = selectedColleges.find(c => c.id === evidenceCollegeId);
                                        if (!college?.subCriteriaScores) return <p className="text-xs text-muted-foreground">No SSR evidence data available.</p>;
                                        return (
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                                {college.ssrSummary && (
                                                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/30 mb-3">
                                                        <p className="text-xs text-muted-foreground italic">{college.ssrSummary}</p>
                                                    </div>
                                                )}
                                                {CRITERIA_DEFINITIONS.map(def => {
                                                    const subs = college.subCriteriaScores!.filter(s => s.subNumber.startsWith(`${def.number}.`));
                                                    if (!subs.length) return null;
                                                    return (
                                                        <div key={def.number} className="space-y-1">
                                                            <p className="text-[11px] font-semibold text-muted-foreground">C{def.number}: {def.title}</p>
                                                            {subs.map(sub => (
                                                                <div key={sub.subNumber} className="pl-3 border-l-2 border-border/40 py-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] font-mono font-bold bg-muted px-1 rounded">{sub.subNumber}</span>
                                                                        <span className="text-[10px] font-medium flex-1">{sub.title}</span>
                                                                        <span className="text-[10px] font-bold tabular-nums" style={{ color: COLLEGE_CHART_COLORS[college.id] }}>
                                                                            {sub.estimatedMarks}/{sub.maxMarks}
                                                                        </span>
                                                                        <Badge variant="outline" className={`text-[8px] px-1 py-0 ${
                                                                            sub.confidence === 'HIGH' ? 'border-emerald-500/40 text-emerald-500' :
                                                                            sub.confidence === 'MEDIUM' ? 'border-amber-500/40 text-amber-500' :
                                                                            'border-red-400/40 text-red-400'
                                                                        }`}>{sub.confidence}</Badge>
                                                                    </div>
                                                                    {sub.keyEvidence && (
                                                                        <p className="text-[10px] text-muted-foreground mt-0.5 italic leading-relaxed">
                                                                            "{sub.keyEvidence}"
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                    {!evidenceCollegeId && (
                                        <p className="text-xs text-muted-foreground text-center py-3">Click a college above to view its SSR evidence</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Notice when no user scores yet */}
                        {userScores.length === 0 && (
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/5">
                                <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                    <strong>Tip:</strong> Upload &amp; analyse documents for any criterion above first. Your scores will then appear here for comparison against the selected benchmark colleges.
                                </p>
                            </div>
                        )}

                        {/* Empty state — no colleges selected */}
                        {!hasComparison && (
                            <div className="text-center py-6 text-muted-foreground">
                                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                                <p className="text-sm">Select benchmark colleges above to compare</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
