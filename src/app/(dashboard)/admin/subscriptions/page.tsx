'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import subscriptionService from '@/lib/services/subscriptionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Check, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

interface Plan { id: string; name: string; price: number; interval: string; features: string[]; recommended?: boolean; }
interface Subscription { id: string; collegeName: string; plan: string; status: string; amount: number; startDate: string; endDate?: string; }

export default function AdminSubscriptionsPage() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [history, setHistory] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [plansRes, histRes] = await Promise.all([
                    subscriptionService.getPlans().catch(() => ({ data: { data: [] } })),
                    subscriptionService.getHistory().catch(() => ({ data: { data: [] } })),
                ]);
                const pData = plansRes.data as unknown as Record<string, unknown>;
                const hData = histRes.data as unknown as Record<string, unknown>;
                setPlans((pData.data as Plan[]) || []);
                setHistory((hData.data as Subscription[]) || []);
            } catch { } finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><div className="grid grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div></div>;

    const defaultPlans: Plan[] = plans.length ? plans : [
        { id: '1', name: 'Basic', price: 9999, interval: 'month', features: ['NAAC module', 'Up to 5 users', 'Basic AI analysis', 'Email support'] },
        { id: '2', name: 'Pro', price: 24999, interval: 'month', recommended: true, features: ['NAAC + NBA + NIRF', 'Up to 25 users', 'Advanced AI analysis', 'Priority support', 'Document vault 10GB'] },
        { id: '3', name: 'Enterprise', price: 49999, interval: 'month', features: ['All frameworks', 'Unlimited users', 'Custom AI models', '24/7 support', 'Unlimited storage', 'API access'] },
    ];

    return (
        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-8">
            <motion.div variants={fadeIn}>
                <h1 className="text-3xl font-bold">Subscriptions</h1>
                <p className="text-muted-foreground mt-1">Manage plans and view subscription history</p>
            </motion.div>

            {/* Plans */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {defaultPlans.map(plan => (
                    <Card key={plan.id} className={`border-border/50 relative ${plan.recommended ? 'ring-2 ring-ring' : ''}`}>
                        {plan.recommended && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Badge className="bg-foreground text-background hover:bg-foreground/90 border-0"><Sparkles className="mr-1 h-3 w-3" />Recommended</Badge></div>
                        )}
                        <CardHeader className="text-center pt-8">
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">₹{(plan.price / 100).toFixed(0)}</span>
                                <span className="text-muted-foreground">/{plan.interval}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 mb-6">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm"><Check className="h-4 w-4 text-emerald-500 shrink-0" />{f}</li>
                                ))}
                            </ul>
                            <Button variant={plan.recommended ? 'default' : 'outline'} className={`w-full ${plan.recommended ? 'bg-foreground text-background hover:bg-foreground/90' : ''}`}>
                                Select Plan
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            {/* History */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-foreground" />Subscription History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {history.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">No subscription history</p>
                        ) : (
                            <Table>
                                <TableHeader><TableRow><TableHead>College</TableHead><TableHead>Plan</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead>Start</TableHead><TableHead>End</TableHead></TableRow></TableHeader>
                                <TableBody>{history.map(s => (
                                    <TableRow key={s.id}><TableCell className="font-medium">{s.collegeName}</TableCell><TableCell>{s.plan}</TableCell><TableCell><Badge className={`${s.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-muted'} text-white border-0`}>{s.status}</Badge></TableCell><TableCell>₹{s.amount?.toLocaleString()}</TableCell><TableCell className="text-muted-foreground">{format(new Date(s.startDate), 'MMM d, yyyy')}</TableCell><TableCell className="text-muted-foreground">{s.endDate ? format(new Date(s.endDate), 'MMM d, yyyy') : '—'}</TableCell></TableRow>
                                ))}</TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
