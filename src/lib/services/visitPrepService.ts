import api from '../api';

export interface ChecklistItem {
    id: string;
    collegeId: string;
    category?: string;
    item: string;
    isCompleted: boolean;
    responsiblePerson?: string;
    notes?: string;
    orderIndex: number;
    isCustom: boolean;
}

export interface MockQA {
    id: string;
    collegeId: string;
    criterionNumber?: number;
    question: string;
    answer?: string;
    isAnswered: boolean;
    orderIndex: number;
}

export interface VisitProgress {
    checklist: {
        total: number;
        completed: number;
        percent: number;
        categoryBreakdown: { category: string; total: number; completed: number; percent: number }[];
    };
    mockQA: {
        total: number;
        answered: number;
        percent: number;
        criterionBreakdown: { criterion: number; total: number; answered: number; percent: number }[];
    };
    overallPercent: number;
}

export const visitPrepService = {
    // Checklist
    initChecklist: () => api.post('/visit-prep/checklist/init'),
    getChecklist: () => api.get('/visit-prep/checklist'),
    addChecklistItem: (data: { item: string; category?: string; responsiblePerson?: string; notes?: string }) =>
        api.post('/visit-prep/checklist', data),
    updateChecklistItem: (id: string, data: Partial<ChecklistItem>) => api.put(`/visit-prep/checklist/${id}`, data),
    deleteChecklistItem: (id: string) => api.delete(`/visit-prep/checklist/${id}`),

    // Mock Q&A
    initMockQA: () => api.post('/visit-prep/mock-qa/init'),
    getMockQA: () => api.get('/visit-prep/mock-qa'),
    addMockQA: (data: { question: string; answer?: string; criterionNumber?: number }) =>
        api.post('/visit-prep/mock-qa', data),
    updateMockQA: (id: string, data: Partial<MockQA>) => api.put(`/visit-prep/mock-qa/${id}`, data),

    // Progress
    getProgress: () => api.get('/visit-prep/progress'),
};
