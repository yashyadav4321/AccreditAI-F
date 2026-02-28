import api from '@/lib/api';

export interface Deadline {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    framework?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    isCompleted: boolean;
    collegeId: string;
    createdAt: string;
}

const deadlineService = {
    list: () =>
        api.get<Deadline[]>('/deadlines'),

    getUpcoming: () =>
        api.get<Deadline[]>('/deadlines/upcoming'),

    create: (data: Partial<Deadline>) =>
        api.post('/deadlines', data),

    markComplete: (id: string) =>
        api.patch(`/deadlines/${id}/complete`),

    delete: (id: string) =>
        api.delete(`/deadlines/${id}`),
};

export default deadlineService;
