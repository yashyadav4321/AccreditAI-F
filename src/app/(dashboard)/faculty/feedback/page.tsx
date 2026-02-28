'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import facultyService from '@/lib/services/facultyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

interface Feedback { id: string; subject: string; rating: number; semester: string; year: number; comments?: string; createdAt: string; }

export default function FeedbackPage() {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try { const res = await facultyService.getFeedback(); const d = res.data as unknown as Record<string, unknown>; setFeedbacks((d.data as Feedback[]) || []); } catch { } finally { setLoading(false); }
        };
        fetch();
    }, []);

    const avg = feedbacks.length ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : '0';

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-80" /></div>;

    return (
        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
            <motion.div variants={fadeIn}>
                <h1 className="text-3xl font-bold">Student Feedback</h1>
                <p className="text-muted-foreground mt-1">View feedback received from students</p>
            </motion.div>

            {/* Summary */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                    <CardContent className="p-6 flex items-center gap-6">
                        <div className="h-16 w-16 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Star className="h-8 w-8 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Average Rating</p>
                            <p className="text-4xl font-bold">{avg}</p>
                        </div>
                        <div className="ml-auto">
                            <p className="text-sm text-muted-foreground">Total Responses</p>
                            <p className="text-2xl font-bold">{feedbacks.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {feedbacks.length === 0 ? (
                <motion.div variants={fadeIn}>
                    <Card className="border-border/50"><CardContent className="py-16 text-center">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No feedback yet</h3>
                        <p className="text-sm text-muted-foreground">Student feedback will appear here once submitted.</p>
                    </CardContent></Card>
                </motion.div>
            ) : (
                <motion.div variants={fadeIn} className="space-y-4">
                    {feedbacks.map(fb => (
                        <Card key={fb.id} className="border-border/50 hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary">{fb.subject}</Badge>
                                        <span className="text-xs text-muted-foreground">{fb.semester} {fb.year}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < fb.rating ? 'text-amber-500 fill-amber-500' : 'text-muted'}`} />
                                        ))}
                                        <span className="ml-2 text-sm font-medium">{fb.rating}/5</span>
                                    </div>
                                </div>
                                {fb.comments && <p className="text-sm text-muted-foreground">{fb.comments}</p>}
                                <p className="text-xs text-muted-foreground mt-2">{format(new Date(fb.createdAt), 'MMM d, yyyy')}</p>
                            </CardContent>
                        </Card>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
}
