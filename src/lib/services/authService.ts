import api from '@/lib/api';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface SignupPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'COLLEGE_ADMIN' | 'FACULTY' | 'HOD' | 'SUPER_ADMIN';
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: User;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'COLLEGE_ADMIN' | 'FACULTY' | 'HOD' | 'SUPER_ADMIN';
    collegeId?: string;
    departmentId?: string;
    isVerified: boolean;
    profileImage?: string;
}

const authService = {
    signup: (data: SignupPayload) =>
        api.post('/auth/signup', data),

    verifyOtp: (data: { email: string; otp: string }) =>
        api.post('/auth/verify-otp', data),

    resendOtp: (data: { email: string }) =>
        api.post('/auth/resend-otp', data),

    login: (data: LoginPayload) =>
        api.post<AuthResponse>('/auth/login', data),

    refreshToken: (data: { refreshToken: string }) =>
        api.post<AuthResponse>('/auth/refresh-token', data),

    forgotPassword: (data: { email: string }) =>
        api.post('/auth/forgot-password', data),

    verifyResetOtp: (data: { email: string; otp: string }) =>
        api.post('/auth/verify-reset-otp', data),

    resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
        api.post('/auth/reset-password', data),

    logout: () =>
        api.post('/auth/logout'),

    changePassword: (data: { oldPassword: string; newPassword: string }) =>
        api.post('/auth/change-password', data),

    getProfile: () =>
        api.get<User>('/auth/profile'),
};

export default authService;
