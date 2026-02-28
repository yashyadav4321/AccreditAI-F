'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/AuthContext';
import notificationService from '@/lib/services/notificationService';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Sun, Moon, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const { user, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchUnread = async () => {
            try {
                const { data } = await notificationService.getUnreadCount();
                const count = (data as Record<string, unknown>).count as number ?? 0;
                setUnreadCount(count);
            } catch {
                // Silently fail
            }
        };
        if (user) fetchUnread();
    }, [user]);

    const initials = user
        ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
        : 'U';

    const settingsHref = user?.role === 'SUPER_ADMIN'
        ? '/admin/dashboard'
        : user?.role === 'FACULTY'
            ? '/faculty/profile'
            : '/settings';

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-6">
            <div className="flex-1" />

            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                {mounted && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="relative"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-4.5 w-4.5 text-amber-400" />
                        ) : (
                            <Moon className="h-4.5 w-4.5" />
                        )}
                    </Button>
                )}

                {/* Notifications */}
                <Link href="/notifications">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-4.5 w-4.5" />
                        {unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-0 badge-pulse">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </Badge>
                        )}
                    </Button>
                </Link>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-foreground text-background text-sm font-semibold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                <Badge variant="secondary" className="w-fit text-[10px] mt-1">
                                    {user?.role?.replace('_', ' ')}
                                </Badge>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={settingsHref} className="flex items-center cursor-pointer">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex items-center cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={logout}
                            className="text-red-500 focus:text-red-500 cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
