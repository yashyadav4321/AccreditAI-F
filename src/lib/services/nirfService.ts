import api from '@/lib/api';

export interface NirfParameter {
    id: string;
    name: string;
    description: string;
    weightage: number;
    maxScore: number;
    currentScore?: number;
    metrics?: NirfMetric[];
}

export interface NirfMetric {
    id: string;
    parameterId: string;
    name: string;
    description: string;
    value?: number;
    maxValue: number;
    unit?: string;
}

export interface NirfDataEntry {
    id: string;
    metricId: string;
    value: number;
    year?: string;
    notes?: string;
}

export interface NirfScoreSummary {
    totalScore: number;
    maxScore: number;
    percentage: number;
    parameterScores: {
        parameterId: string;
        parameterName: string;
        score: number;
        maxScore: number;
        weightage: number;
    }[];
}

const nirfService = {
    getParameters: () =>
        api.get<NirfParameter[]>('/nirf/parameters'),

    getParameterById: (id: string) =>
        api.get<NirfParameter>(`/nirf/parameters/${id}`),

    addDataEntry: (data: Partial<NirfDataEntry>) =>
        api.post('/nirf/data-entries', data),

    updateDataEntry: (id: string, data: Partial<NirfDataEntry>) =>
        api.put(`/nirf/data-entries/${id}`, data),

    deleteDataEntry: (id: string) =>
        api.delete(`/nirf/data-entries/${id}`),

    getScoreSummary: () =>
        api.get<NirfScoreSummary>('/nirf/score-summary'),

    initMetrics: () =>
        api.post('/nirf/init-metrics'),
};

export default nirfService;
