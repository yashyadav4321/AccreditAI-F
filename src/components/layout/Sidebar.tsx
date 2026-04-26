'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
    LayoutDashboard,
    GraduationCap,
    FileText,
    Brain,
    Settings,
    Calendar,
    Bell,
    Building2,
    Users,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    FolderOpen,
    Briefcase,
    MessageSquare,
    UserCircle,
    Sparkles,
    History,
    Star,
    ClipboardCheck,
    Gauge,
    Shield,
    FileBarChart,
    ClipboardList,
    BarChart3,
    CheckSquare,
    HelpCircle,
    Link2,
    ListChecks,
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const COLLEGE_ADMIN_NAV: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        label: 'Accreditation',
        items: [
            { title: 'NAAC', href: '/naac', icon: GraduationCap },
            { title: 'Best Practices', href: '/naac/best-practices', icon: Star },
            { title: 'DVV Tracker', href: '/naac/dvv', icon: ClipboardCheck },
            { title: 'Benchmark', href: '/naac/benchmark', icon: BarChart3 },
            { title: 'Readiness', href: '/readiness', icon: Gauge, badge: 'Score' },
            { title: 'Visit Prep', href: '/visit-prep', icon: ListChecks },
        ],
    },
    {
        label: 'IQAC',
        items: [
            { title: 'Committee', href: '/iqac/committee', icon: Shield },
            { title: 'AQAR Builder', href: '/iqac/aqar-builder', icon: FileBarChart },
            { title: 'AQAR History', href: '/iqac/aqar-history', icon: History },
        ],
    },
    {
        label: 'Student Survey',
        items: [
            { title: 'Survey Builder', href: '/sss/builder', icon: ClipboardList },
            { title: 'Survey Results', href: '/sss/results', icon: BarChart3 },
        ],
    },
    {
        label: 'Management',
        items: [
            { title: 'Documents', href: '/documents', icon: FileText },
            { title: 'Evidence Tags', href: '/evidence', icon: Link2 },
            { title: 'AI Analysis', href: '/ai-analysis', icon: Brain },
            { title: 'HOD Management', href: '/hod/manage', icon: Users },
            { title: 'Audit Trail', href: '/audit-trail', icon: History },
            { title: 'Deadlines', href: '/deadlines', icon: Calendar },
            { title: 'Notifications', href: '/notifications', icon: Bell },
        ],
    },
    {
        label: 'Account',
        items: [
            { title: 'Settings', href: '/settings', icon: Settings },
        ],
    },
];

const FACULTY_NAV: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { title: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        label: 'My Records',
        items: [
            { title: 'Profile', href: '/faculty/profile', icon: UserCircle },
            { title: 'Publications', href: '/faculty/publications', icon: BookOpen },
            { title: 'FDP', href: '/faculty/fdp', icon: FolderOpen },
            { title: 'Projects', href: '/faculty/projects', icon: Briefcase },
            { title: 'Feedback', href: '/faculty/feedback', icon: MessageSquare },
        ],
    },
    {
        label: 'Tasks',
        items: [
            { title: 'My Tasks', href: '/hod/tasks', icon: CheckSquare },
        ],
    },
];

const HOD_NAV: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { title: 'Dashboard', href: '/hod/dashboard', icon: LayoutDashboard },
        ],
    },
    {
        label: 'Department',
        items: [
            { title: 'Assign Tasks', href: '/hod/dashboard', icon: ClipboardList },
            { title: 'Submissions', href: '/hod/submissions', icon: CheckSquare },
        ],
    },
    {
        label: 'Accreditation',
        items: [
            { title: 'NAAC', href: '/naac', icon: GraduationCap },
            { title: 'Visit Prep', href: '/visit-prep', icon: ListChecks },
        ],
    },
    {
        label: 'Account',
        items: [
            { title: 'Settings', href: '/settings', icon: Settings },
        ],
    },
];

const SUPER_ADMIN_NAV: NavGroup[] = [
    {
        label: 'Platform',
        items: [
            { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
            { title: 'Colleges', href: '/admin/colleges', icon: Building2 },
            { title: 'Users', href: '/admin/subscriptions', icon: Users },
            { title: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
        ],
    },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();

    const navGroups =
        user?.role === 'SUPER_ADMIN'
            ? SUPER_ADMIN_NAV
            : user?.role === 'HOD'
                ? HOD_NAV
                : user?.role === 'FACULTY'
                    ? FACULTY_NAV
                    : COLLEGE_ADMIN_NAV;

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300',
                    collapsed ? 'w-[68px]' : 'w-[260px]'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-border px-4">
                    {!collapsed && (
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                                <>
                                    <img src="/logo-black-bg.jpg" alt="AccreditAI Logo" className="h-full w-full object-contain dark:hidden" />
                                    <img src="/logo-white-bg.jpg" alt="AccreditAI Logo" className="h-full w-full object-contain hidden dark:block" />
                                </>
                            </div>
                            <span className="text-lg font-bold tracking-tight">
                                AccreditAI
                            </span>
                        </Link>
                    )}
                    {collapsed && (
                        <div className="flex h-8 w-8 mx-auto shrink-0 items-center justify-center rounded-lg overflow-hidden">
                            <img src="/logo.png" alt="AccreditAI Logo" className="h-full w-full object-contain" />
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <ScrollArea className="h-[calc(100vh-8rem)]">
                    <nav className="p-3 space-y-6">
                        {navGroups.map((group) => (
                            <div key={group.label}>
                                {!collapsed && (
                                    <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        {group.label}
                                    </p>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isActive =
                                            pathname === item.href || pathname.startsWith(item.href + '/');
                                        const Icon = item.icon;

                                        const linkContent = (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                    isActive
                                                        ? 'bg-accent text-foreground'
                                                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                                    collapsed && 'justify-center px-2'
                                                )}
                                            >
                                                <Icon className={cn('h-4.5 w-4.5 shrink-0', isActive && 'text-foreground')} />
                                                {!collapsed && <span>{item.title}</span>}
                                            </Link>
                                        );

                                        if (collapsed) {
                                            return (
                                                <Tooltip key={item.href}>
                                                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                                                    <TooltipContent side="right" className="font-medium">
                                                        {item.title}
                                                    </TooltipContent>
                                                </Tooltip>
                                            );
                                        }

                                        return linkContent;
                                    })}
                                </div>
                            </div>
                        ))}
                    </nav>
                </ScrollArea>

                {/* Collapse Toggle */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-border p-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full justify-center"
                    >
                        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        {!collapsed && <span className="ml-2">Collapse</span>}
                    </Button>
                </div>
            </aside>
        </TooltipProvider>
    );
}
