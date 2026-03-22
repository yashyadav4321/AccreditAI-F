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

export interface NaacSubCriterionScore {
    subNumber: string;
    title: string;
    estimatedMarks: number;
    maxMarks: number;
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
    status: 'COMPLETE' | 'PARTIAL' | 'INCOMPLETE';
    justification: string;
    checklistItems: string[];
    recommendations?: string[];
}

export interface CriterionScoreSummary {
    criterionNumber: number;
    title: string;
    estimatedMarks: number;
    maxMarks: number;
}

export interface NaacDocumentAnalysisResult {
    summary: string;
    overallEstimatedScore: number;
    maxPossibleScore: number;
    checklistUsed: string;
    criteriaScores: CriterionScoreSummary[];
    subCriteriaScores: NaacSubCriterionScore[];
    processingTime: number;
    tokenCount: number;
}

export interface NaacCriterionAnalysis {
    criterionNumber: number;
    title: string;
    score: number;
    maxScore: number;
    status: string;
    strengths: string[];
    weaknesses: string[];
    gaps: string[];
    recommendations: string[];
}

export interface NaacGapAnalysisResult {
    summary: string;
    overallScore: number;
    criteriaAnalysis: NaacCriterionAnalysis[];
    recommendations: string[];
    processingTime?: number;
    tokenCount?: number;
}

export type NaacAnalysisResultUnion = NaacDocumentAnalysisResult | NaacGapAnalysisResult;

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

    analyzeDocuments: (formData: FormData, scope?: { criterionNumber?: number; subCriterionNumbers?: string[] }) => {
        if (scope?.criterionNumber) {
            formData.append('criterionNumber', String(scope.criterionNumber));
        }
        if (scope?.subCriterionNumbers?.length) {
            formData.append('subCriterionNumbers', scope.subCriterionNumbers.join(','));
        }
        return api.post<NaacDocumentAnalysisResult>('/naac/analyze-documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 600000,
        });
    },

    analyzeDocumentsOnly: (formData: FormData) =>
        api.post<NaacDocumentAnalysisResult>('/naac/analyze-documents-only', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 600000,
        }),

    analyzeOnly: (criterionId?: string) =>
        api.post<NaacGapAnalysisResult>('/naac/analyze-only', { criterionId }, {
            timeout: 600000,
        }),

    confirmAnalysis: (analysisResult: NaacAnalysisResultUnion) =>
        api.post('/naac/confirm-analysis', { analysisResult }),
};

export default naacService;
