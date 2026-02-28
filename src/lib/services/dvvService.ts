import api from '@/lib/api';

export interface DvvQuery {
    id: string;
    collegeId: string;
    queryNumber: string;
    criterionRef?: string;
    queryText: string;
    responseText?: string;
    evidenceUrls: string[];
    status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    deadline?: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface DvvSummary {
    total: number;
    resolved: number;
    pending: number;
    inProgress: number;
    completionPercentage: number;
}

const dvvService = {
    getAll: () =>
        api.get<DvvQuery[]>('/dvv'),

    getById: (id: string) =>
        api.get<DvvQuery>(`/dvv/${id}`),

    create: (data: Partial<DvvQuery>) =>
        api.post('/dvv', data),

    update: (id: string, data: Partial<DvvQuery>) =>
        api.put(`/dvv/${id}`, data),

    delete: (id: string) =>
        api.delete(`/dvv/${id}`),

    getSummary: () =>
        api.get<DvvSummary>('/dvv/summary'),
};

export default dvvService;
