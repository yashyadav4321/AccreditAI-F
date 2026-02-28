import api from '@/lib/api';

export interface BestPractice {
    id: string;
    collegeId: string;
    title: string;
    objectives: string;
    context?: string;
    practice: string;
    evidenceOfSuccess?: string;
    problemsEncountered?: string;
    resourcesRequired?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

const bestPracticeService = {
    getAll: () =>
        api.get<BestPractice[]>('/best-practices'),

    getById: (id: string) =>
        api.get<BestPractice>(`/best-practices/${id}`),

    create: (data: Partial<BestPractice>) =>
        api.post('/best-practices', data),

    update: (id: string, data: Partial<BestPractice>) =>
        api.put(`/best-practices/${id}`, data),

    delete: (id: string) =>
        api.delete(`/best-practices/${id}`),
};

export default bestPracticeService;
