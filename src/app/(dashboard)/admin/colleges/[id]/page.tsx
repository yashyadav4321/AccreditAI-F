'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import adminService from '@/lib/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Building2, Users, Globe, MapPin, Calendar, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CollegeDetail {
    id: string; name: string; type: string; university?: string;
    address?: string; city?: string; state?: string; pincode?: string;
    website?: string; phone?: string; email?: string;
    status: string; usersCount?: number; departmentsCount?: number;
    frameworks?: string[]; createdAt: string; subscription?: { plan: string; status: string; expiresAt?: string };
}

export default function AdminCollegeDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [college, setCollege] = useState<CollegeDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await adminService.getCollegeById(id);
                const d = res.data as Record<string, unknown>;
                setCollege((d.data as CollegeDetail) || d as unknown as CollegeDetail);
            } catch { toast.error('Failed to load college'); } finally { setLoading(false); }
        };
        fetch();
    }, [id]);

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-40" /><Skeleton className="h-60" /></div>;
    if (!college) return <p className="text-center text-muted-foreground py-16">College not found.</p>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{college.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{college.type}</Badge>
                        <Badge className={`${college.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'} text-white border-0`}>{college.status}</Badge>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-border/50"><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><Users className="h-6 w-6 text-blue-500" /></div><div><p className="text-2xl font-bold">{college.usersCount ?? 0}</p><p className="text-sm text-muted-foreground">Users</p></div></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center"><Building2 className="h-6 w-6 text-foreground" /></div><div><p className="text-2xl font-bold">{college.departmentsCount ?? 0}</p><p className="text-sm text-muted-foreground">Departments</p></div></CardContent></Card>
                <Card className="border-border/50"><CardContent className="p-6 flex items-center gap-4"><div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Calendar className="h-6 w-6 text-emerald-500" /></div><div><p className="text-sm font-bold">{format(new Date(college.createdAt), 'MMM d, yyyy')}</p><p className="text-sm text-muted-foreground">Joined</p></div></CardContent></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-border/50">
                    <CardHeader><CardTitle>Institution Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {college.university && <div><p className="text-xs text-muted-foreground">University</p><p className="font-medium">{college.university}</p></div>}
                        {college.address && <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-muted-foreground mt-1 shrink-0" /><div><p className="text-xs text-muted-foreground">Address</p><p>{college.address}, {college.city}, {college.state} {college.pincode}</p></div></div>}
                        {college.website && <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /><a href={college.website} target="_blank" className="text-foreground underline hover:no-underline text-sm">{college.website}</a></div>}
                        {college.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><p className="text-sm">{college.phone}</p></div>}
                        {college.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><p className="text-sm">{college.email}</p></div>}
                    </CardContent>
                </Card>

                <Card className="border-border/50">
                    <CardHeader><CardTitle>Subscription & Frameworks</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {college.subscription ? (
                            <div className="p-4 rounded-lg bg-muted/30">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium">{college.subscription.plan} Plan</p>
                                    <Badge className={`${college.subscription.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'} text-white border-0`}>{college.subscription.status}</Badge>
                                </div>
                                {college.subscription.expiresAt && <p className="text-xs text-muted-foreground">Expires: {format(new Date(college.subscription.expiresAt), 'MMM d, yyyy')}</p>}
                            </div>
                        ) : <p className="text-sm text-muted-foreground">No active subscription</p>}
                        <Separator />
                        <div>
                            <p className="text-sm font-medium mb-2">Active Frameworks</p>
                            <div className="flex gap-2 flex-wrap">
                                {(college.frameworks || []).map(fw => <Badge key={fw} variant="secondary">{fw}</Badge>)}
                                {(!college.frameworks || college.frameworks.length === 0) && <p className="text-sm text-muted-foreground">No frameworks selected</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}
