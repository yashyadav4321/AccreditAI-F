import api from '@/lib/api';

export interface College {
    id: string;
    name: string;
    type: string;
    university: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    website?: string;
    phone?: string;
    establishedYear?: number;
    accreditationStatus?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Department {
    id: string;
    name: string;
    code: string;
    collegeId: string;
    hodName?: string;
    hodEmail?: string;
    facultyCount?: number;
    studentCount?: number;
    createdAt: string;
}

export interface OnboardingPayload {
    name: string;           // backend: name (was collegeName)
    type: string;
    affiliation?: string;   // backend: affiliation (was university)
    location: string;       // backend: location (was address)
    city: string;
    state: string;
    pincode?: string;
    website?: string;
    phone?: string;
    establishedYear?: number;
    frameworks?: string[];
}

const collegeService = {
    create: (data: Partial<College>) =>
        api.post('/colleges', data),

    completeOnboarding: (data: OnboardingPayload) =>
        api.post('/colleges/onboarding', data),

    listAll: (params?: { page?: number; limit?: number }) =>
        api.get('/colleges', { params }),

    getById: (id: string) =>
        api.get<College>(`/colleges/${id}`),

    update: (id: string, data: Partial<College>) =>
        api.put(`/colleges/${id}`, data),

    toggleActive: (id: string) =>
        api.patch(`/colleges/${id}/toggle-active`),

    addDepartment: (collegeId: string, data: { name: string; code: string }) =>
        api.post(`/colleges/${collegeId}/departments`, data),

    getDepartments: (collegeId: string) =>
        api.get<Department[]>(`/colleges/${collegeId}/departments`),
};

export default collegeService;
