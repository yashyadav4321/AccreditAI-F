'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import facultyService from '@/lib/services/facultyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

interface FacultyProfile {
    designation?: string;
    department?: string;
    specialization?: string;
    experience?: number;
    qualifications?: string;
    bio?: string;
    phone?: string;
}

export default function FacultyProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<FacultyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<FacultyProfile>({});

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await facultyService.getProfile();
                const d = (res.data as unknown as Record<string, unknown>).data as FacultyProfile || {};
                setProfile(d);
                setForm(d);
            } catch { /* empty profile */ } finally { setLoading(false); }
        };
        fetch();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await facultyService.updateProfile(form);
            toast.success('Profile updated');
        } catch { toast.error('Update failed'); } finally { setSaving(false); }
    };

    const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '';
    const initials = fullName ? fullName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() : 'U';

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-80" /></div>;

    return (
        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6 max-w-3xl">
            <motion.div variants={fadeIn}>
                <h1 className="text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground mt-1">Manage your academic profile</p>
            </motion.div>

            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-6 mb-8">
                            <Avatar className="h-20 w-20"><AvatarFallback className="bg-foreground text-background text-2xl">{initials}</AvatarFallback></Avatar>
                            <div>
                                <h2 className="text-2xl font-bold">{fullName || 'Faculty'}</h2>
                                <p className="text-muted-foreground">{user?.email}</p>
                                <Badge variant="secondary" className="mt-1">{form.designation || 'Faculty'}</Badge>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Designation</Label><Input value={form.designation || ''} onChange={e => setForm({ ...form, designation: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Department</Label><Input value={form.department || ''} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Specialization</Label><Input value={form.specialization || ''} onChange={e => setForm({ ...form, specialization: e.target.value })} /></div>
                                <div className="space-y-2"><Label>Experience (years)</Label><Input type="number" value={form.experience || ''} onChange={e => setForm({ ...form, experience: Number(e.target.value) })} /></div>
                            </div>
                            <div className="space-y-2"><Label>Qualifications</Label><Input value={form.qualifications || ''} onChange={e => setForm({ ...form, qualifications: e.target.value })} placeholder="Ph.D in Computer Science" /></div>
                            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} rows={4} /></div>
                            <Button onClick={handleSave} disabled={saving} className="bg-foreground text-background hover:bg-foreground/90">
                                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : 'Save Profile'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
