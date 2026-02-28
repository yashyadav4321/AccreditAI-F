import api from '@/lib/api';

export interface FacultyProfile {
    id: string;
    userId: string;
    name: string;
    email: string;
    designation: string;
    qualification: string;
    specialization: string;
    experience: number;
    departmentId: string;
    departmentName?: string;
    phone?: string;
    joinDate?: string;
}

export interface Publication {
    id: string;
    title: string;
    authors: string;
    journal: string;
    year: number;
    volume?: string;
    pages?: string;
    doi?: string;
    indexing?: string;
    impactFactor?: number;
    type: string;
}

export interface FdpRecord {
    id: string;
    title: string;
    organizer: string;
    type: string;
    startDate: string;
    endDate: string;
    duration: number;
    certificate?: string;
}

export interface Project {
    id: string;
    title: string;
    fundingAgency: string;
    amount: number;
    startDate: string;
    endDate?: string;
    status: string;
    role: string;
    pi?: string;
}

export interface FeedbackScore {
    id: string;
    subject: string;
    semester: string;
    academicYear: string;
    score: number;
    maxScore: number;
    respondents: number;
}

const facultyService = {
    getProfile: () =>
        api.get<FacultyProfile>('/faculty/profile'),

    updateProfile: (data: Partial<FacultyProfile>) =>
        api.post('/faculty/profile', data),

    getPublications: () =>
        api.get<Publication[]>('/faculty/publications'),

    addPublication: (data: Partial<Publication>) =>
        api.post('/faculty/publications', data),

    getFdp: () =>
        api.get<FdpRecord[]>('/faculty/fdp'),

    addFdp: (data: Partial<FdpRecord>) =>
        api.post('/faculty/fdp', data),

    getProjects: () =>
        api.get<Project[]>('/faculty/projects'),

    addProject: (data: Partial<Project>) =>
        api.post('/faculty/projects', data),

    getFeedback: () =>
        api.get<FeedbackScore[]>('/faculty/feedback'),

    addFeedback: (data: Partial<FeedbackScore>) =>
        api.post('/faculty/feedback', data),

    deletePublication: (id: string) =>
        api.delete(`/faculty/publications/${id}`),

    deleteFDP: (id: string) =>
        api.delete(`/faculty/fdp/${id}`),

    deleteProject: (id: string) =>
        api.delete(`/faculty/projects/${id}`),
};

export default facultyService;
