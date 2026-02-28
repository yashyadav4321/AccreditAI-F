import api from '@/lib/api';

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
    createdAt: string;
    user?: { id: string; firstName: string; lastName: string; email: string };
}

export interface AuditLogResponse {
    logs: AuditLog[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

const auditService = {
    getLogs: (params?: Record<string, string | number>) =>
        api.get<AuditLogResponse>('/audit', { params }),

    getLogById: (id: string) =>
        api.get<AuditLog>(`/audit/${id}`),

    getEntityTypes: () =>
        api.get<string[]>('/audit/entity-types'),
};

export default auditService;
