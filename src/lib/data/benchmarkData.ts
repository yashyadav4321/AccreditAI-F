/**
 * Benchmark NAAC Data — 9 A++ colleges across 3 streams × 3 city tiers.
 *
 * This module provides TWO data modes:
 *
 * 1. **Estimated Data** (default fallback):
 *    Criterion-wise scores are realistic estimates derived from each college's
 *    published CGPA and known academic strengths.
 *
 * 2. **Real SSR Data** (when extraction has been run):
 *    Sub-criterion-level scores extracted by GPT-4o from actual SSR PDF documents,
 *    including evidence quotes and strengths per sub-criterion.
 *
 * Max marks per criterion (NAAC manual):
 *   C1 = 150, C2 = 200, C3 = 150, C4 = 100, C5 = 100, C6 = 100, C7 = 100
 *   Total = 900 (weighted to 1000 via CGPA conversion)
 */

import type { BenchmarkSSRData, BenchmarkSubCriterionScore } from '@/lib/services/naacService';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Stream = 'Arts' | 'Commerce' | 'Science';
export type Region = 'Tier 1' | 'Tier 2' | 'Tier 3';

/** Comparison mode selector */
export type ComparisonMode = 'estimated' | 'ssr';

export interface CriterionScore {
    criterionNumber: number;
    title: string;
    score: number;
    maxMarks: number;
}

export interface BenchmarkCollege {
    id: string;
    name: string;
    city: string;
    state: string;
    region: Region;
    stream: Stream;
    cgpa: number;
    grade: string;
    criteriaScores: CriterionScore[];
    /** Sub-criterion-level data from real SSR extraction (only when mode=ssr) */
    subCriteriaScores?: BenchmarkSubCriterionScore[];
    /** Overall summary from SSR extraction */
    ssrSummary?: string;
    /** Whether this college has real SSR data available */
    hasSSRData?: boolean;
}

// ─── Criterion definitions ───────────────────────────────────────────────────

export const CRITERIA_DEFINITIONS: { number: number; title: string; maxMarks: number }[] = [
    { number: 1, title: 'Curricular Aspects', maxMarks: 150 },
    { number: 2, title: 'Teaching-Learning and Evaluation', maxMarks: 200 },
    { number: 3, title: 'Research, Innovations and Extension', maxMarks: 150 },
    { number: 4, title: 'Infrastructure and Learning Resources', maxMarks: 100 },
    { number: 5, title: 'Student Support and Progression', maxMarks: 100 },
    { number: 6, title: 'Governance, Leadership and Management', maxMarks: 100 },
    { number: 7, title: 'Institutional Values and Best Practices', maxMarks: 100 },
];

const MAX_TOTAL = 900; // sum of all maxMarks

// ─── Helper ──────────────────────────────────────────────────────────────────

function buildCriteria(scores: number[]): CriterionScore[] {
    return CRITERIA_DEFINITIONS.map((def, i) => ({
        criterionNumber: def.number,
        title: def.title,
        score: scores[i],
        maxMarks: def.maxMarks,
    }));
}

// ─── Estimated Benchmark Colleges (fallback when SSR extraction not done) ────

export const BENCHMARK_COLLEGES_ESTIMATED: BenchmarkCollege[] = [
    // ── Tier 1 ───────────────────────────────────────────────────────────────
    {
        id: 'hindu-college',
        name: 'Hindu College',
        city: 'New Delhi',
        state: 'Delhi',
        region: 'Tier 1',
        stream: 'Arts',
        cgpa: 3.60,
        grade: 'A++',
        criteriaScores: buildCriteria([125, 170, 105, 82, 85, 88, 95]),
    },
    {
        id: 'loyola-college',
        name: 'Loyola College',
        city: 'Chennai',
        state: 'Tamil Nadu',
        region: 'Tier 1',
        stream: 'Commerce',
        cgpa: 3.68,
        grade: 'A++',
        criteriaScores: buildCriteria([130, 178, 112, 85, 88, 90, 92]),
    },
    {
        id: 'st-xaviers-mumbai',
        name: "St. Xavier's College (Autonomous)",
        city: 'Mumbai',
        state: 'Maharashtra',
        region: 'Tier 1',
        stream: 'Science',
        cgpa: 3.60,
        grade: 'A++',
        criteriaScores: buildCriteria([120, 168, 130, 84, 80, 86, 88]),
    },

    // ── Tier 2 ───────────────────────────────────────────────────────────────
    {
        id: 'st-teresas-kochi',
        name: "St. Teresa's College (Autonomous)",
        city: 'Kochi',
        state: 'Kerala',
        region: 'Tier 2',
        stream: 'Arts',
        cgpa: 3.57,
        grade: 'A++',
        criteriaScores: buildCriteria([122, 165, 100, 80, 82, 85, 93]),
    },
    {
        id: 'ss-jain-subodh',
        name: 'S. S. Jain Subodh P.G. College',
        city: 'Jaipur',
        state: 'Rajasthan',
        region: 'Tier 2',
        stream: 'Commerce',
        cgpa: 3.82,
        grade: 'A++',
        criteriaScores: buildCriteria([135, 182, 118, 88, 92, 93, 95]),
    },
    {
        id: 'hicas-coimbatore',
        name: 'Hindusthan College of Arts and Science (HICAS)',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        region: 'Tier 2',
        stream: 'Science',
        cgpa: 3.55,
        grade: 'A++',
        criteriaScores: buildCriteria([118, 162, 125, 82, 78, 84, 86]),
    },

    // ── Tier 3 ───────────────────────────────────────────────────────────────
    {
        id: 'sacred-heart-tirupattur',
        name: 'Sacred Heart College (Autonomous)',
        city: 'Tirupattur',
        state: 'Tamil Nadu',
        region: 'Tier 3',
        stream: 'Arts',
        cgpa: 3.61,
        grade: 'A++',
        criteriaScores: buildCriteria([124, 168, 108, 83, 84, 86, 95]),
    },
    {
        id: 'aggarwal-ballabgarh',
        name: 'Aggarwal College',
        city: 'Ballabgarh',
        state: 'Haryana',
        region: 'Tier 3',
        stream: 'Commerce',
        cgpa: 3.57,
        grade: 'A++',
        criteriaScores: buildCriteria([120, 166, 105, 82, 84, 88, 90]),
    },
    {
        id: 'st-thomas-palai',
        name: 'St. Thomas College',
        city: 'Palai',
        state: 'Kerala',
        region: 'Tier 3',
        stream: 'Science',
        cgpa: 3.56,
        grade: 'A++',
        criteriaScores: buildCriteria([118, 164, 126, 80, 78, 85, 87]),
    },
];

// Keep backward-compatible alias
export const BENCHMARK_COLLEGES = BENCHMARK_COLLEGES_ESTIMATED;

// ─── Convert SSR Data to BenchmarkCollege format ─────────────────────────────

/**
 * Merge real SSR extraction data with the estimated college metadata.
 * Returns a BenchmarkCollege[] that uses real scores + evidence when available.
 */
export function mergeSSRData(ssrDataArray: BenchmarkSSRData[]): BenchmarkCollege[] {
    const ssrMap = new Map<string, BenchmarkSSRData>();
    ssrDataArray.forEach(d => ssrMap.set(d.collegeId, d));

    return BENCHMARK_COLLEGES_ESTIMATED.map(college => {
        const ssr = ssrMap.get(college.id);
        if (!ssr) return { ...college, hasSSRData: false };

        // Build criterion scores from SSR data
        const criteriaScores: CriterionScore[] = CRITERIA_DEFINITIONS.map(def => {
            const ssrCriterion = ssr.criteriaScores?.find(
                (cs: { criterionNumber: number }) => cs.criterionNumber === def.number
            );
            return {
                criterionNumber: def.number,
                title: def.title,
                score: ssrCriterion?.estimatedMarks ?? college.criteriaScores.find(c => c.criterionNumber === def.number)?.score ?? 0,
                maxMarks: def.maxMarks,
            };
        });

        return {
            ...college,
            criteriaScores,
            subCriteriaScores: ssr.subCriteriaScores,
            ssrSummary: ssr.summary,
            hasSSRData: true,
        };
    });
}

// ─── Filter helpers ──────────────────────────────────────────────────────────

export const ALL_STREAMS: Stream[] = ['Arts', 'Commerce', 'Science'];
export const ALL_REGIONS: Region[] = ['Tier 1', 'Tier 2', 'Tier 3'];

export function filterColleges(
    stream: Stream | 'All',
    region: Region | 'All',
    colleges: BenchmarkCollege[] = BENCHMARK_COLLEGES,
): BenchmarkCollege[] {
    return colleges.filter(c => {
        const streamMatch = stream === 'All' || c.stream === stream;
        const regionMatch = region === 'All' || c.region === region;
        return streamMatch && regionMatch;
    });
}

// ─── Color palette for chart lines (one per benchmark college) ───────────────

export const COLLEGE_CHART_COLORS: Record<string, string> = {
    'hindu-college': '#3b82f6',          // blue
    'loyola-college': '#8b5cf6',         // violet
    'st-xaviers-mumbai': '#06b6d4',      // cyan
    'st-teresas-kochi': '#f59e0b',       // amber
    'ss-jain-subodh': '#10b981',         // emerald
    'hicas-coimbatore': '#ec4899',       // pink
    'sacred-heart-tirupattur': '#f97316', // orange
    'aggarwal-ballabgarh': '#6366f1',    // indigo
    'st-thomas-palai': '#14b8a6',        // teal
};

export const STREAM_COLORS: Record<Stream, string> = {
    Arts: '#f59e0b',
    Commerce: '#3b82f6',
    Science: '#10b981',
};

export const REGION_COLORS: Record<Region, string> = {
    'Tier 1': '#8b5cf6',
    'Tier 2': '#06b6d4',
    'Tier 3': '#f97316',
};
