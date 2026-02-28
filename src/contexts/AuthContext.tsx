'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import authService, { User } from '@/lib/services/authService';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: 'COLLEGE_ADMIN' | 'FACULTY' | 'HOD' | 'SUPER_ADMIN';
    }) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/login', '/signup', '/verify-otp', '/forgot-password', '/reset-password'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const loadUser = useCallback(async () => {
        try {
            const storedToken = localStorage.getItem('accreditai_token');
            if (!storedToken) {
                setIsLoading(false);
                return;
            }
            setToken(storedToken);
            const { data } = await authService.getProfile();
            // Backend wraps: { success, message, data: { user } } or { success, message, data: User }
            const responseData = data as unknown as Record<string, unknown>;
            const payload = (responseData.data as unknown as Record<string, unknown>) || responseData;
            const userData = (payload.user as User) || (payload as unknown as User);
            setUser(userData);
        } catch {
            localStorage.removeItem('accreditai_token');
            localStorage.removeItem('accreditai_refresh_token');
            setToken(null);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    // Redirect logic
    useEffect(() => {
        if (isLoading) return;

        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

        if (!user && !isPublicRoute) {
            router.push('/login');
        }

        if (user && (pathname === '/login' || pathname === '/signup')) {
            // Redirect based on role
            if (user.role === 'SUPER_ADMIN') {
                router.push('/admin/dashboard');
            } else if (user.role === 'FACULTY') {
                router.push('/faculty/dashboard');
            } else if (user.role === 'COLLEGE_ADMIN') {
                if (!user.collegeId) {
                    router.push('/onboarding');
                } else {
                    router.push('/dashboard');
                }
            }
        }
    }, [user, isLoading, pathname, router]);

    const login = async (email: string, password: string) => {
        const { data } = await authService.login({ email, password });
        // Backend wraps: { success, message, data: { accessToken, refreshToken, user } }
        const responseData = data as unknown as Record<string, unknown>;
        const payload = (responseData.data as unknown as Record<string, unknown>) || responseData;

        // Backend uses 'accessToken' (not 'token')
        const authToken = (payload.accessToken as string) || (payload.token as string) || '';
        const refreshToken = (payload.refreshToken as string) || '';
        const userData = (payload.user as User) || (payload as unknown as User);

        if (!authToken || !userData?.role) {
            throw new Error('Invalid login response from server');
        }

        localStorage.setItem('accreditai_token', authToken);
        localStorage.setItem('accreditai_refresh_token', refreshToken);
        setToken(authToken);
        setUser(userData);

        // Route based on role
        if (userData.role === 'SUPER_ADMIN') {
            router.push('/admin/dashboard');
        } else if (userData.role === 'FACULTY') {
            router.push('/faculty/dashboard');
        } else if (userData.role === 'COLLEGE_ADMIN') {
            if (!userData.collegeId) {
                router.push('/onboarding');
            } else {
                router.push('/dashboard');
            }
        }
    };

    const signup = async (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: 'COLLEGE_ADMIN' | 'FACULTY' | 'HOD' | 'SUPER_ADMIN';
    }) => {
        await authService.signup(data);
        router.push('/login');
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch {
            // Fail silently
        }
        localStorage.removeItem('accreditai_token');
        localStorage.removeItem('accreditai_refresh_token');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    const refreshUser = async () => {
        await loadUser();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
