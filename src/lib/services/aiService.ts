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
    analyzeNaac: (criterionId?: string) =>
        api.post('/ai/analyze/naac', { criterionId }),

    runFullAnalysis: () => api.post('/ai/analyze/full'),

    generateReport: (framework: string, reportType: string) =>
        api.post('/ai/reports/generate', { framework, reportType }),

    getReports: (framework?: string) =>
        api.get('/ai/reports', { params: { framework } }),

    getReportById: (id: string) => api.get(`/ai/reports/${id}`),

    deleteReport: (id: string) => api.delete(`/ai/reports/${id}`),
};

export default aiService;
