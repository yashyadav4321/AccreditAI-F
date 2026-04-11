import api from '@/lib/api';

export interface ReadinessScore {
    overallScore: number;
    breakdown: {
        naac: { score: number; weight: number; label: string; compliant: number; total: number };
        documents: { score: number; weight: number; label: string; count: number };
        dvv: { score: number; weight: number; label: string; resolved: number; total: number };
    };
    actions: string[];
}

const readinessService = {
    getScore: () =>
        api.get<ReadinessScore>('/readiness/score'),
};

export default readinessService;
