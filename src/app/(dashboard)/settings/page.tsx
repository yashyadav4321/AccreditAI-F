'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings as SettingsIcon, User, Moon, Sun, Shield, Bell, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import authService from '@/lib/services/authService';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

export default function SettingsPage() {
    const { user, refreshUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const [changingPassword, setChangingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
        if (newPassword.length < 8) { toast.error('Min 8 characters'); return; }
        setChangingPassword(true);
        try {
            await authService.changePassword({ oldPassword, newPassword });
            toast.success('Password changed!');
            setOldPassword(''); setNewPassword(''); setConfirmPassword('');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Password change failed');
        } finally { setChangingPassword(false); }
    };

    const initials = (user?.firstName && user?.lastName) ? `${user.firstName[0]}${user.lastName[0]}` : 'U';

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6 max-w-3xl">
            <motion.div variants={fadeIn}>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
            </motion.div>

            {/* Profile */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-foreground" />Profile</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-foreground text-background text-xl">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-semibold">{user?.firstName} {user?.lastName}</h3>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                                <Badge variant="secondary" className="mt-1">{user?.role?.replace('_', ' ')}</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Appearance */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="flex items-center gap-2">{theme === 'dark' ? <Moon className="h-5 w-5 text-foreground" /> : <Sun className="h-5 w-5 text-foreground" />}Appearance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Dark Mode</p>
                                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                            </div>
                            <Switch checked={theme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Security */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-foreground" />Security</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <h4 className="font-medium">Change Password</h4>
                            <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} /></div>
                            <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                            <div className="space-y-2"><Label>Confirm New Password</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
                            <Button onClick={handleChangePassword} disabled={changingPassword} className="bg-foreground text-background hover:bg-foreground/90">
                                {changingPassword ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Changing...</> : 'Change Password'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
