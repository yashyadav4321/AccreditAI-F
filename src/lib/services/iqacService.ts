import api from '../api';

export interface IqacMember {
    id: string;
    collegeId: string;
    name: string;
    designation: string;
    iqacRole: string;
    department?: string;
    email: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
}

export interface Aqar {
    id: string;
    collegeId: string;
    academicYear: string;
    version: number;
    status: string;
    partA: any;
    partB: any;
    partC: any;
    generatedById?: string;
    generatedByName?: string;
    submittedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AqarDeadline {
    id: string;
    collegeId: string;
    deadline: string;
}

export const iqacService = {
    // Members
    getMembers: () => api.get('/iqac/members'),
    createMember: (data: Partial<IqacMember>) => api.post('/iqac/members', data),
    updateMember: (id: string, data: Partial<IqacMember>) => api.put(`/iqac/members/${id}`, data),
    deleteMember: (id: string) => api.delete(`/iqac/members/${id}`),

    // AQAR
    generateAqar: (academicYear: string) => api.post('/iqac/aqar/generate', { academicYear }),
    getAqarList: () => api.get('/iqac/aqar'),
    getAqarById: (id: string) => api.get(`/iqac/aqar/${id}`),
    updateAqar: (id: string, data: Partial<Aqar>) => api.put(`/iqac/aqar/${id}`, data),

    // Deadline
    setDeadline: (deadline: string) => api.post('/iqac/aqar/deadline', { deadline }),
    getDeadline: () => api.get('/iqac/aqar/deadline'),
};
