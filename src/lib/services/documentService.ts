import api from '@/lib/api';

export interface Document {
    id: string;
    name: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    module: string;
    category: string;
    uploadedBy: string;
    uploadedAt: string;
    collegeId: string;
}

export interface DocumentStats {
    totalDocuments: number;
    totalSize: number;
    byModule: Record<string, number>;
    byCategory: Record<string, number>;
}

const documentService = {
    upload: (formData: FormData) =>
        api.post('/documents/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    bulkUpload: (formData: FormData) =>
        api.post('/documents/bulk-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    list: (params?: { module?: string; category?: string; search?: string; framework?: string; page?: number; limit?: number }) =>
        api.get('/documents', { params }),

    getStats: () =>
        api.get<DocumentStats>('/documents/stats'),

    getById: (id: string) =>
        api.get<Document>(`/documents/${id}`),

    getPreview: (id: string) =>
        api.get(`/documents/${id}/preview`),

    delete: (id: string) =>
        api.delete(`/documents/${id}`),
};

export default documentService;
