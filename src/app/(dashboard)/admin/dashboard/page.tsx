'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import adminService from '@/lib/services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Building2, Users, CreditCard, TrendingUp, Activity, Globe } from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#10B981', '#F59E0B'];

interface AdminDashData {
    totalColleges: number;
    totalUsers: number;
    activeSubscriptions: number;
    revenue: number;
    collegesByState?: { state: string; count: number }[];
    subscriptionBreakdown?: { plan: string; count: number }[];
    monthlySignups?: { month: string; count: number }[];
}

export default function AdminDashboardPage() {
    const [data, setData] = useState<AdminDashData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await adminService.getAnalytics();
                const d = res.data as unknown as Record<string, unknown>;
                setData((d.data as AdminDashData) || (d as unknown as AdminDashData));
            } catch {
                toast.error('Failed to load admin dashboard');
            } finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="grid grid-cols-4 gap-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div><Skeleton className="h-80" /></div>;

    const stats = [
        { title: 'Total Colleges', value: data?.totalColleges || 0, icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: 'text-muted-foreground', bg: 'bg-accent0/10' },
        { title: 'Active Plans', value: data?.activeSubscriptions || 0, icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Revenue', value: `₹${((data?.revenue || 0) / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn}>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Platform overview and analytics</p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map(stat => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={stat.title} variants={fadeIn}>
                            <Card className="hover:shadow-lg transition-shadow border-border/50">
                                <CardContent className="p-6 flex items-center justify-between">
                                    <div><p className="text-sm text-muted-foreground">{stat.title}</p><p className="text-3xl font-bold mt-1">{stat.value}</p></div>
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
                        <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-foreground" />Monthly Signups</CardTitle></CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={data?.monthlySignups || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={{ fill: '#4F46E5', r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-muted-foreground" />Subscription Breakdown</CardTitle></CardHeader>
                        <CardContent className="flex items-center justify-center">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={data?.subscriptionBreakdown || []} cx="50%" cy="50%" outerRadius={100} dataKey="count" label={({ payload }: { payload?: { plan?: string } }) => payload?.plan || ''}>
                                        {(data?.subscriptionBreakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-emerald-500" />Colleges by State</CardTitle></CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={data?.collegesByState || []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="state" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#7C3AED" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
