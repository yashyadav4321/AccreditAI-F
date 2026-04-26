'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
    BarChart3, Filter, Building2, MapPin, GraduationCap,
    TrendingUp, Award, ChevronDown, ChevronUp, Info,
} from 'lucide-react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    Legend, ResponsiveContainer, Cell,
} from 'recharts';
import {
    BENCHMARK_COLLEGES, CRITERIA_DEFINITIONS,
    COLLEGE_CHART_COLORS, STREAM_COLORS, REGION_COLORS,
    filterColleges,
    type BenchmarkCollege, type Stream, type Region,
} from '@/lib/data/benchmarkData';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const STREAM_OPTIONS: ('All' | Stream)[] = ['All', 'Arts', 'Commerce', 'Science'];
const REGION_OPTIONS: ('All' | Region)[] = ['All', 'Tier 1', 'Tier 2', 'Tier 3'];

export default function BenchmarkPage() {
    const [streamFilter, setStreamFilter] = useState<'All' | Stream>('All');
    const [regionFilter, setRegionFilter] = useState<'All' | Region>('All');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(true);

    // Filtered colleges based on dropdowns
    const filteredColleges = useMemo(
        () => filterColleges(streamFilter, regionFilter),
        [streamFilter, regionFilter],
    );

    // Actually selected colleges for comparison
    const selectedColleges = useMemo(
        () => BENCHMARK_COLLEGES.filter(c => selectedIds.has(c.id)),
        [selectedIds],
    );

    const toggleCollege = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        const ids = filteredColleges.map(c => c.id);
        setSelectedIds(new Set(ids));
    };

    const clearAll = () => setSelectedIds(new Set());

    // ── Chart data ───────────────────────────────────────────────────────

    const radarData = useMemo(() => {
        return CRITERIA_DEFINITIONS.map(def => {
            const entry: Record<string, string | number> = {
                criterion: `C${def.number}`,
                fullName: def.title,
                max: def.maxMarks,
            };
            selectedColleges.forEach(c => {
                const cs = c.criteriaScores.find(s => s.criterionNumber === def.number);
                entry[c.id] = cs ? Math.round((cs.score / cs.maxMarks) * 100) : 0;
            });
            return entry;
        });
    }, [selectedColleges]);

    const barData = useMemo(() => {
        return CRITERIA_DEFINITIONS.map(def => {
            const entry: Record<string, string | number> = {
                criterion: `C${def.number}`,
                fullName: def.title,
            };
            selectedColleges.forEach(c => {
                const cs = c.criteriaScores.find(s => s.criterionNumber === def.number);
                entry[c.id] = cs?.score ?? 0;
            });
            return entry;
        });
    }, [selectedColleges]);

    // Total scores for each selected college
    const totals = useMemo(() => {
        return selectedColleges.map(c => ({
            ...c,
            total: c.criteriaScores.reduce((s, cs) => s + cs.score, 0),
            maxTotal: c.criteriaScores.reduce((s, cs) => s + cs.maxMarks, 0),
        }));
    }, [selectedColleges]);

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            {/* Header */}
            <motion.div variants={fadeIn} className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Benchmark Comparison</h1>
                    <p className="text-muted-foreground mt-1">
                        Compare your college against A++ accredited institutions across India
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                >
                    <Filter className="h-4 w-4" />
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                    {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </Button>
            </motion.div>

            {/* Filter Bar */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-border/50">
                            <CardContent className="p-5">
                                <div className="flex flex-wrap items-end gap-5">
                                    {/* Stream filter */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            Stream
                                        </label>
                                        <div className="flex gap-1 p-1 bg-muted rounded-xl">
                                            {STREAM_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setStreamFilter(opt)}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
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

                                    {/* Region filter */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5" />
                                            Region
                                        </label>
                                        <div className="flex gap-1 p-1 bg-muted rounded-xl">
                                            {REGION_OPTIONS.map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setRegionFilter(opt)}
                                                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
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

                                    {/* Quick actions */}
                                    <div className="flex gap-2 ml-auto">
                                        <Button size="sm" variant="outline" onClick={selectAll}>
                                            Select All ({filteredColleges.length})
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={clearAll}>
                                            Clear
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* College Selection Grid */}
            <motion.div variants={fadeIn}>
                <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Select Colleges to Compare</h2>
                    <Badge variant="outline" className="ml-2 text-xs">
                        {selectedIds.size} selected
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredColleges.map(college => {
                        const isSelected = selectedIds.has(college.id);
                        const total = college.criteriaScores.reduce((s, cs) => s + cs.score, 0);
                        const maxTotal = college.criteriaScores.reduce((s, cs) => s + cs.maxMarks, 0);
                        const pct = Math.round((total / maxTotal) * 100);

                        return (
                            <motion.div
                                key={college.id}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <Card
                                    className={`cursor-pointer transition-all duration-200 ${
                                        isSelected
                                            ? 'border-foreground/40 bg-accent/50 ring-1 ring-foreground/10'
                                            : 'border-border/50 hover:border-border'
                                    }`}
                                    onClick={() => toggleCollege(college.id)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleCollege(college.id)}
                                                className="mt-0.5 shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm leading-tight">
                                                    {college.name}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-1.5">
                                                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                                                    <span className="text-xs text-muted-foreground">
                                                        {college.city}, {college.state}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] px-2 py-0"
                                                        style={{
                                                            borderColor: STREAM_COLORS[college.stream] + '60',
                                                            color: STREAM_COLORS[college.stream],
                                                            backgroundColor: STREAM_COLORS[college.stream] + '15',
                                                        }}
                                                    >
                                                        {college.stream}
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] px-2 py-0"
                                                        style={{
                                                            borderColor: REGION_COLORS[college.region] + '60',
                                                            color: REGION_COLORS[college.region],
                                                            backgroundColor: REGION_COLORS[college.region] + '15',
                                                        }}
                                                    >
                                                        {college.region}
                                                    </Badge>
                                                    <span className="ml-auto text-xs font-bold text-muted-foreground tabular-nums">
                                                        CGPA {college.cgpa.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>

            {/* ── Comparison Results ─────────────────────────────────────── */}
            <AnimatePresence>
                {selectedColleges.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="space-y-6"
                    >
                        {/* CGPA Overview Cards */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <h2 className="text-sm font-semibold">Overall CGPA Comparison</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                                {totals
                                    .sort((a, b) => b.cgpa - a.cgpa)
                                    .map(c => (
                                        <Card key={c.id} className="border-border/50">
                                            <CardContent className="p-4 text-center">
                                                <div
                                                    className="h-2 w-full rounded-full mb-3"
                                                    style={{ backgroundColor: COLLEGE_CHART_COLORS[c.id] + '30' }}
                                                >
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${(c.cgpa / 4) * 100}%`,
                                                            backgroundColor: COLLEGE_CHART_COLORS[c.id],
                                                        }}
                                                    />
                                                </div>
                                                <p className="text-2xl font-bold tabular-nums" style={{ color: COLLEGE_CHART_COLORS[c.id] }}>
                                                    {c.cgpa.toFixed(2)}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1 font-medium truncate">{c.name}</p>
                                                <p className="text-[10px] text-muted-foreground/70">{c.city}</p>
                                                <p className="text-xs font-bold mt-1 tabular-nums text-muted-foreground">
                                                    {c.total}/{c.maxTotal}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Radar Chart */}
                            <Card className="border-border/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        Criteria Performance (% of Max)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2">
                                    <ResponsiveContainer width="100%" height={380}>
                                        <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                                            <PolarGrid stroke="var(--border)" />
                                            <PolarAngleAxis
                                                dataKey="criterion"
                                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                            />
                                            <PolarRadiusAxis
                                                angle={90}
                                                domain={[0, 100]}
                                                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                                            />
                                            {selectedColleges.map(c => (
                                                <Radar
                                                    key={c.id}
                                                    name={c.name}
                                                    dataKey={c.id}
                                                    stroke={COLLEGE_CHART_COLORS[c.id]}
                                                    fill={COLLEGE_CHART_COLORS[c.id]}
                                                    fillOpacity={0.08}
                                                    strokeWidth={2}
                                                />
                                            ))}
                                            <Legend
                                                wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                                            />
                                            <RTooltip
                                                contentStyle={{
                                                    backgroundColor: 'var(--card)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                }}
                                                formatter={(value: number) => [`${value}%`, '']}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Bar Chart */}
                            <Card className="border-border/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                        Criterion-wise Scores (Absolute)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-2">
                                    <ResponsiveContainer width="100%" height={380}>
                                        <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                                            <YAxis
                                                type="category"
                                                dataKey="criterion"
                                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                                width={36}
                                            />
                                            {selectedColleges.map(c => (
                                                <Bar
                                                    key={c.id}
                                                    dataKey={c.id}
                                                    name={c.name}
                                                    fill={COLLEGE_CHART_COLORS[c.id]}
                                                    radius={[0, 4, 4, 0]}
                                                    barSize={selectedColleges.length > 4 ? 6 : 10}
                                                />
                                            ))}
                                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} />
                                            <RTooltip
                                                contentStyle={{
                                                    backgroundColor: 'var(--card)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '8px',
                                                    fontSize: '12px',
                                                }}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary Table */}
                        <Card className="border-border/50 overflow-hidden">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                    Detailed Score Comparison
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border/50 bg-muted/30">
                                                <th className="text-left px-4 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                                                    Criterion
                                                </th>
                                                <th className="text-center px-3 py-3 font-semibold text-muted-foreground whitespace-nowrap">
                                                    Max
                                                </th>
                                                {selectedColleges.map(c => (
                                                    <th key={c.id} className="text-center px-3 py-3 whitespace-nowrap">
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <div
                                                                className="h-2 w-2 rounded-full"
                                                                style={{ backgroundColor: COLLEGE_CHART_COLORS[c.id] }}
                                                            />
                                                            <span className="font-semibold text-xs">{c.name}</span>
                                                            <span className="text-[10px] text-muted-foreground">{c.city}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {CRITERIA_DEFINITIONS.map(def => (
                                                <tr key={def.number} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                                                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                                                        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded mr-2">
                                                            C{def.number}
                                                        </span>
                                                        {def.title}
                                                    </td>
                                                    <td className="text-center px-3 py-3 text-muted-foreground font-mono text-xs">
                                                        {def.maxMarks}
                                                    </td>
                                                    {selectedColleges.map(c => {
                                                        const cs = c.criteriaScores.find(s => s.criterionNumber === def.number);
                                                        const score = cs?.score ?? 0;
                                                        const pct = Math.round((score / def.maxMarks) * 100);
                                                        const color = pct >= 85 ? 'text-emerald-500' : pct >= 70 ? 'text-foreground' : 'text-amber-500';
                                                        return (
                                                            <td key={c.id} className="text-center px-3 py-3">
                                                                <span className={`font-bold tabular-nums ${color}`}>
                                                                    {score}
                                                                </span>
                                                                <span className="text-muted-foreground text-[10px] ml-0.5">
                                                                    ({pct}%)
                                                                </span>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                            {/* Totals row */}
                                            <tr className="bg-muted/30 font-bold">
                                                <td className="px-4 py-3">Total</td>
                                                <td className="text-center px-3 py-3 text-muted-foreground font-mono text-xs">900</td>
                                                {totals.map(c => (
                                                    <td key={c.id} className="text-center px-3 py-3">
                                                        <span style={{ color: COLLEGE_CHART_COLORS[c.id] }}>
                                                            {c.total}
                                                        </span>
                                                        <span className="text-muted-foreground text-[10px] ml-0.5">
                                                            ({Math.round((c.total / c.maxTotal) * 100)}%)
                                                        </span>
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Empty state */}
            {selectedColleges.length === 0 && (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50 border-dashed">
                        <CardContent className="p-12 text-center">
                            <BarChart3 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-muted-foreground">No colleges selected</p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                                Select one or more colleges above to see the comparison charts and tables
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </motion.div>
    );
}
