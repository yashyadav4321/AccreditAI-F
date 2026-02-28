'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import dashboardService, { DashboardData } from '@/lib/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GraduationCap, Award, TrendingUp, FileText, Clock, AlertTriangle, Brain, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const COLORS = ['#4F46E5', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#F97316'];

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await dashboardService.getData();
                // Backend wraps: { success, message, data: { ... } }
                const raw = response.data as unknown as Record<string, unknown>;
                setData((raw.data as DashboardData) || (raw as unknown as DashboardData));
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-64" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
                <motion.div variants={fadeIn}>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your accreditation overview.</p>
                </motion.div>
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardContent className="p-12 text-center space-y-4">
                            <div className="mx-auto h-16 w-16 rounded-2xl bg-accent flex items-center justify-center">
                                <GraduationCap className="h-8 w-8 text-foreground" />
                            </div>
                            <h2 className="text-xl font-semibold">Get Started with Your Dashboard</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Your dashboard will come alive as you start adding data. Begin by exploring the sections below.
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 max-w-2xl mx-auto">
                                {[
                                    { label: 'NAAC', href: '/naac', icon: GraduationCap, color: 'text-blue-500' },
                                    { label: 'NBA', href: '/nba', icon: Award, color: 'text-muted-foreground' },
                                    { label: 'NIRF', href: '/nirf', icon: TrendingUp, color: 'text-amber-500' },
                                    { label: 'Documents', href: '/documents', icon: FileText, color: 'text-emerald-500' },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <a key={item.label} href={item.href} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors">
                                            <Icon className={`h-5 w-5 ${item.color}`} />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>
        );
    }

    // Map backend response to stats cards
    const naacScore = data.compliance?.naac?.overallScore || 0;
    const nbaCount = data.compliance?.nba?.programCount || 0;
    const nirfScore = data.compliance?.nirf?.overallScore || 0;
    const totalDocs = data.documents?.totalCount || 0;
    const pendingTasks = data.pendingTasks || 0;
    const upcomingDeadlineCount = data.upcomingDeadlines?.length || 0;

    const stats = [
        { title: 'NAAC Compliance', value: `${naacScore}%`, icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'NBA Programs', value: nbaCount, icon: Award, color: 'text-muted-foreground', bg: 'bg-accent0/10' },
        { title: 'NIRF Score', value: nirfScore, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'Total Documents', value: totalDocs, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    // NAAC criteria bar chart data
    const naacBarData = (data.compliance?.naac?.criteria || []).map((c) => ({
        criterion: `C${c.number}`,
        percentage: c.score,
        title: c.title,
    }));

    // Pie chart data
    const pieData = [
        { name: 'Completed', value: naacScore },
        { name: 'Remaining', value: 100 - naacScore },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            {/* Header */}
            <motion.div variants={fadeIn}>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your accreditation overview.</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={stat.title} variants={fadeIn}>
                            <Card className="hover:shadow-lg transition-shadow duration-300 border-border/50">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                                            <p className="text-3xl font-bold mt-1">{stat.value}</p>
                                        </div>
                                        <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                            <Icon className={`h-6 w-6 ${stat.color}`} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* NAAC Progress Bar Chart */}
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5 text-foreground" />
                                NAAC Criteria Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {naacBarData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={naacBarData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="criterion" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                        <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--muted-foreground))' }} />
                                        <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                                            {naacBarData.map((_, i) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-16">No NAAC criteria data yet. Start by updating your criteria scores.</p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Overall Compliance Pie Chart */}
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-muted-foreground" />
                                Overall Compliance
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                                        <Cell fill="#4F46E5" />
                                        <Cell fill="hsl(var(--muted))" />
                                    </Pie>
                                    <RTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} wrapperStyle={{ zIndex: 10 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute text-center pointer-events-none">
                                <p className="text-4xl font-bold">{naacScore}%</p>
                                <p className="text-sm text-muted-foreground">Compliance</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Deadlines */}
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-amber-500" />
                                Upcoming Deadlines
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(data.upcomingDeadlines || []).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No upcoming deadlines</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.upcomingDeadlines.slice(0, 5).map((dl) => (
                                        <div key={dl.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                <div>
                                                    <p className="text-sm font-medium">{dl.title}</p>
                                                    <p className="text-xs text-muted-foreground">{dl.framework}</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="text-xs">{format(new Date(dl.dueDate), 'MMM d')}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(data.recentActivity || []).length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
                            ) : (
                                <div className="space-y-3">
                                    {data.recentActivity.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                                            <div className="h-2 w-2 rounded-full bg-accent0 mt-2" />
                                            <div>
                                                <p className="text-sm">{activity.action} {activity.entity}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">{activity.user} • {format(new Date(activity.createdAt), 'MMM d, h:mm a')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Stats Bar */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50 bg-gradient-to-r from-foreground/5 to-foreground/5">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                                <p className="text-2xl font-bold text-amber-500">{pendingTasks}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
                                <p className="text-2xl font-bold text-red-500">{upcomingDeadlineCount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">NBA Programs</p>
                                <p className="text-2xl font-bold text-muted-foreground">{nbaCount}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">NIRF Score</p>
                                <p className="text-2xl font-bold text-emerald-500">{nirfScore}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
