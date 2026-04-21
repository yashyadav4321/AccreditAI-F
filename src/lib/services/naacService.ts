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

export interface AnalysisStatusResponse {
    reportId: string;
    status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
    result: NaacDocumentAnalysisResult | null;
    errorMessage: string | null;
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

    /** Uploads files and returns { reportId, status: 'PROCESSING' } immediately. */
    analyzeDocuments: (formData: FormData, scope?: { criterionNumber?: number; subCriterionNumbers?: string[] }) => {
        if (scope?.criterionNumber) {
            formData.append('criterionNumber', String(scope.criterionNumber));
        }
        if (scope?.subCriterionNumbers?.length) {
            formData.append('subCriterionNumbers', scope.subCriterionNumbers.join(','));
        }
        return api.post<{ reportId: string; status: string }>('/naac/analyze-documents', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            timeout: 60000, // Only needs 60s now — just uploads files & gets reportId
        });
    },

    /** Poll the backend for analysis status. */
    getAnalysisStatus: (reportId: string) =>
        api.get<AnalysisStatusResponse>(`/naac/analysis-status/${reportId}`),

    /**
     * Convenience helper: polls getAnalysisStatus every `intervalMs` until
     * the report reaches COMPLETED or FAILED. Returns the final result or throws.
     */
    pollForResult: async (
        reportId: string,
        intervalMs = 5000,
        maxAttempts = 120,
    ): Promise<NaacDocumentAnalysisResult> => {
        for (let i = 0; i < maxAttempts; i++) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));

            const res = await naacService.getAnalysisStatus(reportId);
            const d = res.data as unknown as Record<string, unknown>;
            const status = (d.data as AnalysisStatusResponse) || (res.data as unknown as AnalysisStatusResponse);

            if (status.status === 'COMPLETED' && status.result) {
                return status.result as NaacDocumentAnalysisResult;
            }
            if (status.status === 'FAILED') {
                throw new Error(status.errorMessage || 'Analysis failed');
            }
            // still PROCESSING — continue polling
        }
        throw new Error('Analysis timed out. Please try again.');
    },

    confirmAnalysis: (analysisResult: NaacAnalysisResultUnion) =>
        api.post('/naac/confirm-analysis', { analysisResult }),
};

export default naacService;
