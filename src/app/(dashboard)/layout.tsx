'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import PageTransition from '@/components/layout/PageTransition';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isLoading, isAuthenticated } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Listen for sidebar toggle
    useEffect(() => {
        const handler = () => {
            const sidebar = document.querySelector('aside');
            if (sidebar) {
                setSidebarCollapsed(sidebar.classList.contains('w-[68px]'));
            }
        };
        const observer = new MutationObserver(handler);
        const sidebar = document.querySelector('aside');
        if (sidebar) {
            observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
        }
        return () => observer.disconnect();
    }, [isAuthenticated]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="space-y-4 w-full max-w-md px-8">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                    <div className="space-y-3 mt-8">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-3/4" />
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // AuthContext redirects to login
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <div
                className={cn(
                    'transition-all duration-300',
                    sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'
                )}
            >
                <Navbar />
                <main className="p-6">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>
        </div>
    );
}
