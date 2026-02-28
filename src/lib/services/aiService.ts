import api from '@/lib/api';

export interface AiReport {
    id: string;
    framework: 'NAAC' | 'NBA' | 'NIRF';
    reportType: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    content?: Record<string, unknown>;
    summary?: string;
    recommendations?: string[];
    gaps?: string[];
    score?: number;
    createdAt: string;
    updatedAt: string;
}

const aiService = {
    analyzeNaac: (data?: { criterionId?: string }) =>
        api.post('/ai/analyze/naac', data),

    analyzeNba: (data: { programId: string }) =>
        api.post('/ai/analyze/nba', data),

    analyzeNirf: () =>
        api.post('/ai/analyze/nirf'),

    analyzeFull: () =>
        api.post('/ai/analyze/full'),

    generateReport: (data: { framework: string; reportType: string }) =>
        api.post('/ai/reports/generate', data),

    getReports: (params?: { framework?: string }) =>
        api.get<AiReport[]>('/ai/reports', { params }),

    getReportById: (id: string) =>
        api.get<AiReport>(`/ai/reports/${id}`),
};

export default aiService;
