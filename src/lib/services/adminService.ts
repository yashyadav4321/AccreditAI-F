import api from '@/lib/api';

export interface AdminDashboard {
    totalColleges: number;
    activeColleges: number;
    totalUsers: number;
    totalRevenue: number;
    recentSignups: { date: string; count: number }[];
    subscriptionBreakdown: { plan: string; count: number }[];
    collegesByState: { state: string; count: number }[];
}

export interface AdminCollege {
    id: string;
    name: string;
    type: string;
    city: string;
    state: string;
    isActive: boolean;
    plan: string;
    usersCount: number;
    createdAt: string;
}

const adminService = {
    getDashboard: () =>
        api.get<AdminDashboard>('/admin/dashboard'),

    getAnalytics: () =>
        api.get<AdminDashboard>('/admin/dashboard'),

    getColleges: (params?: { page?: number; limit?: number; search?: string }) =>
        api.get('/admin/colleges', { params }),

    getCollegeById: (id: string) =>
        api.get(`/admin/colleges/${id}`),

    toggleCollegeActive: (id: string) =>
        api.patch(`/admin/colleges/${id}/toggle-active`),

    updateSubscription: (data: { collegeId: string; plan: string; expiresAt?: string }) =>
        api.post('/admin/subscriptions', data),
};

export default adminService;
