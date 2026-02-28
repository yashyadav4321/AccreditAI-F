import api from '../api';

export interface EvidenceTag {
    id: string;
    collegeId: string;
    documentId: string;
    module: 'NAAC' | 'NBA' | 'NIRF';
    criterionId: string;
    criterionRef?: string;
    taggedById: string;
    taggedAt: string;
    document?: { id: string; fileName: string; originalName: string; fileUrl?: string; fileType: string; fileSize?: number };
    taggedBy?: { firstName: string; lastName: string };
}

export interface CoverageScore {
    overall: number;
    naac: { coverage: number; totalCriteria: number; tagged: number };
    nba: { coverage: number; totalItems: number; tagged: number };
    nirf: { coverage: number; totalParams: number; tagged: number };
    totalDocumentsTagged: number;
}

export const evidenceService = {
    tagDocument: (data: { documentId: string; module: string; criterionId: string; criterionRef?: string }) =>
        api.post('/evidence/tag', data),
    untagDocument: (tagId: string) => api.delete(`/evidence/tag/${tagId}`),
    getTagsByCriterion: (module: string, criterionId: string) =>
        api.get(`/evidence/by-criterion?module=${module}&criterionId=${criterionId}`),
    getTagsByModule: (module: string) => api.get(`/evidence/by-module?module=${module}`),
    getTagsByDocument: (documentId: string) => api.get(`/evidence/by-document/${documentId}`),
    getCoverageScore: () => api.get('/evidence/coverage'),
};
