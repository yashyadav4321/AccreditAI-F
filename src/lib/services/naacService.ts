import api from '@/lib/api';

export interface NaacCriterion {
    id: string;
    number: number;
    name: string;
    description: string;
    weightage: number;
    subCriteria?: NaacSubCriterion[];
    completionPercentage?: number;
}

export interface NaacSubCriterion {
    id: string;
    criterionId: string;
    number: string;
    name: string;
    description: string;
    status: 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'NOT_STARTED';
    maxScore: number;
    currentScore?: number;
    documents?: NaacDocument[];
}

export interface NaacDocument {
    id: string;
    name: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
}

export interface ComplianceSummary {
    overallPercentage: number;
    criteriaBreakdown: {
        criterionId: string;
        criterionName: string;
        percentage: number;
        totalSubCriteria: number;
        completedSubCriteria: number;
    }[];
}

const naacService = {
    getCriteria: () =>
        api.get<NaacCriterion[]>('/naac/criteria'),

    getCriterionById: (id: string) =>
        api.get<NaacCriterion>(`/naac/criteria/${id}`),

    addSubCriterion: (criterionId: string, data: Partial<NaacSubCriterion>) =>
        api.post(`/naac/criteria/${criterionId}/sub-criteria`, data),

    updateSubCriterion: (id: string, data: Partial<NaacSubCriterion>) =>
        api.put(`/naac/sub-criteria/${id}`, data),

    uploadDocument: (criterionId: string, formData: FormData) =>
        api.post(`/naac/criteria/${criterionId}/documents`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    deleteDocument: (id: string) =>
        api.delete(`/naac/documents/${id}`),

    getComplianceSummary: () =>
        api.get<ComplianceSummary>('/naac/compliance-summary'),

    initSubCriteria: () =>
        api.post('/naac/init-sub-criteria'),
};

export default naacService;
