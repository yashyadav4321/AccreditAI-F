import api from '../api';

export interface NirfHistoricalScore {
    id: string;
    collegeId: string;
    academicYear: string;
    overallScore: number;
    overallRank?: number;
    tlrScore?: number;
    rpcScore?: number;
    goScore?: number;
    oiScore?: number;
    perceptionScore?: number;
}

export interface NirfCompetitor {
    id: string;
    collegeId: string;
    name: string;
    scores: { academicYear: string; overallScore: number; overallRank?: number; tlr?: number; rpc?: number; go?: number; oi?: number; perception?: number }[];
}

export interface SimulationResult {
    inputs: Record<string, number>;
    weights: Record<string, number>;
    estimatedScore: number;
    estimatedRankBracket: string;
    breakdown: { parameter: string; score: number; weight: number; contribution: number }[];
}

export interface ComparisonData {
    historical: NirfHistoricalScore[];
    competitors: NirfCompetitor[];
    chartData: Record<string, any>[];
    years: string[];
}

export const nirfComparisonService = {
    // Historical
    getHistoricalScores: () => api.get('/nirf-comparison/historical'),
    upsertHistoricalScore: (data: Omit<NirfHistoricalScore, 'id' | 'collegeId'>) =>
        api.post('/nirf-comparison/historical', data),
    deleteHistoricalScore: (id: string) => api.delete(`/nirf-comparison/historical/${id}`),

    // Competitors
    getCompetitors: () => api.get('/nirf-comparison/competitors'),
    addCompetitor: (data: { name: string; scores: any[] }) => api.post('/nirf-comparison/competitors', data),
    updateCompetitor: (id: string, data: { name?: string; scores?: any[] }) =>
        api.put(`/nirf-comparison/competitors/${id}`, data),
    deleteCompetitor: (id: string) => api.delete(`/nirf-comparison/competitors/${id}`),

    // Simulator
    simulate: (data: { tlrScore: number; rpcScore: number; goScore: number; oiScore: number; perceptionScore: number }) =>
        api.post('/nirf-comparison/simulate', data),

    // Combined
    getComparisonData: () => api.get('/nirf-comparison/comparison'),
};
