import api from '../api';

export interface HodAccount {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    departmentId: string;
    department?: { id: string; name: string };
}

export interface HodTask {
    id: string;
    collegeId: string;
    departmentId?: string;
    assignedById: string;
    assignedToId: string;
    title: string;
    description?: string;
    criterionRef?: string;
    framework?: string;
    deadline?: string;
    status: string;
    createdAt: string;
    assignedTo?: { id: string; firstName: string; lastName: string; email: string };
    assignedBy?: { firstName: string; lastName: string };
    submissions?: HodSubmission[];
}

export interface HodSubmission {
    id: string;
    taskId: string;
    submittedById: string;
    dataValue?: string;
    documentUrls: string[];
    status: string;
    reviewComment?: string;
    reviewedAt?: string;
    submittedAt: string;
    task?: { id: string; title: string; criterionRef?: string; framework?: string };
    submittedBy?: { id: string; firstName: string; lastName: string; email: string };
}

export interface DepartmentOverview {
    departmentId: string;
    departmentName: string;
    hod: { id: string; firstName: string; lastName: string; email: string } | null;
    totalTasks: number;
    completedTasks: number;
    completionPercent: number;
    pendingSubmissions: number;
}

export const hodService = {
    // Admin
    createHodAccount: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string; departmentId: string }) =>
        api.post('/hod/accounts', data),
    getHodAccounts: () => api.get('/hod/accounts'),
    updateHodAccount: (id: string, data: Partial<HodAccount>) => api.put(`/hod/accounts/${id}`, data),
    getDepartmentOverview: () => api.get('/hod/department-overview'),

    // HOD
    getHodDashboard: () => api.get('/hod/dashboard'),
    createTask: (data: { assignedToId: string; title: string; description?: string; criterionRef?: string; framework?: string; deadline?: string }) =>
        api.post('/hod/tasks', data),
    updateTask: (id: string, data: Partial<HodTask>) => api.put(`/hod/tasks/${id}`, data),
    getPendingSubmissions: () => api.get('/hod/submissions'),
    reviewSubmission: (id: string, data: { status: string; reviewComment?: string }) =>
        api.put(`/hod/submissions/${id}/review`, data),

    // Faculty
    getFacultyTasks: () => api.get('/hod/faculty-tasks'),
    submitData: (taskId: string, data: { dataValue?: string; documentUrls?: string[] }) =>
        api.post(`/hod/faculty-tasks/${taskId}/submit`, data),
};
