'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import facultyService from '@/lib/services/facultyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BookOpen, Award, Briefcase, Star, TrendingUp, FileText } from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#10B981', '#F59E0B'];

interface FacultyDashboardData {
    publications: number;
    fdps: number;
    projects: number;
    feedbackAvg: number;
    recentPublications: { id: string; title: string; journal: string; year: number }[];
    stats?: { label: string; value: number }[];
}

export default function FacultyDashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState<FacultyDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pubRes, fdpRes, projRes, fbRes] = await Promise.all([
                    facultyService.getPublications().catch(() => ({ data: { data: [] } })),
                    facultyService.getFdp().catch(() => ({ data: { data: [] } })),
                    facultyService.getProjects().catch(() => ({ data: { data: [] } })),
                    facultyService.getFeedback().catch(() => ({ data: { data: [] } })),
                ]);
                const pubs = ((pubRes.data as unknown as Record<string, unknown>).data as { id: string; title: string; journal: string; year: number }[]) || [];
                const fdps = ((fdpRes.data as unknown as Record<string, unknown>).data as unknown[]) || [];
                const projs = ((projRes.data as unknown as Record<string, unknown>).data as unknown[]) || [];
                const fbs = ((fbRes.data as unknown as Record<string, unknown>).data as { rating: number }[]) || [];
                const avg = fbs.length ? fbs.reduce((s, f) => s + (f.rating || 0), 0) / fbs.length : 0;
                setData({
                    publications: pubs.length, fdps: fdps.length, projects: projs.length, feedbackAvg: Number(avg.toFixed(1)),
                    recentPublications: pubs.slice(0, 5),
                    stats: [
                        { label: 'Publications', value: pubs.length },
                        { label: 'FDPs', value: fdps.length },
                        { label: 'Projects', value: projs.length },
                        { label: 'Feedback', value: Number(avg.toFixed(1)) },
                    ],
                });
            } catch { toast.error('Failed to load dashboard'); } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="grid grid-cols-4 gap-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div><Skeleton className="h-80" /></div>;

    const stats = [
        { title: 'Publications', value: data?.publications || 0, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'FDPs Attended', value: data?.fdps || 0, icon: Award, color: 'text-muted-foreground', bg: 'bg-accent0/10' },
        { title: 'Projects', value: data?.projects || 0, icon: Briefcase, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Avg Feedback', value: data?.feedbackAvg || 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    const pieData = [
        { name: 'Publications', value: data?.publications || 0 },
        { name: 'FDPs', value: data?.fdps || 0 },
        { name: 'Projects', value: data?.projects || 0 },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn}>
                <h1 className="text-3xl font-bold">Welcome, {user?.firstName || 'Faculty'}</h1>
                <p className="text-muted-foreground mt-1">Your academic activity overview</p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={stat.title} variants={fadeIn}>
                            <Card className="hover:shadow-lg transition-shadow border-border/50">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                    </div>
                                    <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}><Icon className={`h-6 w-6 ${stat.color}`} /></div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-foreground" />Activity Overview</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={data?.stats || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {(data?.stats || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-muted-foreground" />Recent Publications</CardTitle></CardHeader>
                        <CardContent>
                            {(data?.recentPublications || []).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No publications yet</p>
                            ) : (
                                <div className="space-y-3">
                                    {data?.recentPublications?.map(pub => (
                                        <div key={pub.id} className="p-3 rounded-lg bg-muted/30">
                                            <p className="text-sm font-medium">{pub.title}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{pub.journal} • {pub.year}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
