'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import notificationService, { Notification } from '@/lib/services/notificationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.list();
            const raw = res.data as any;
            const list = raw?.data ?? raw;
            setNotifications(Array.isArray(list) ? list : []);
        } catch { toast.error('Failed to load notifications'); } finally { setLoading(false); }
    };

    useEffect(() => { fetchNotifications(); }, []);

    const markAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            toast.success('All marked as read');
            fetchNotifications();
        } catch { toast.error('Failed'); }
    };

    const markRead = async (id: string) => {
        try { await notificationService.markAsRead(id); fetchNotifications(); } catch { }
    };

    const handleDelete = async (id: string) => {
        try { await notificationService.delete(id); toast.success('Deleted'); fetchNotifications(); } catch { toast.error('Delete failed'); }
    };

    const typeIcon = (type?: string) => {
        switch (type) { case 'WARNING': return <AlertTriangle className="h-5 w-5 text-amber-500" />; case 'SUCCESS': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />; default: return <Info className="h-5 w-5 text-blue-500" />; }
    };

    const unread = notifications.filter(n => !n.isRead);

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-80" /></div>;

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Notifications</h1>
                    <p className="text-muted-foreground mt-1">{unread.length} unread notification{unread.length !== 1 ? 's' : ''}</p>
                </div>
                {unread.length > 0 && (
                    <Button variant="outline" onClick={markAllRead}><CheckCheck className="mr-2 h-4 w-4" />Mark All Read</Button>
                )}
            </motion.div>

            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardContent className="p-0">
                        {notifications.length === 0 ? (
                            <div className="py-16 text-center">
                                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-1">All caught up!</h3>
                                <p className="text-sm text-muted-foreground">No notifications at this time.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/50">
                                {notifications.map(n => (
                                    <motion.div key={n.id} variants={fadeIn} onClick={() => !n.isRead && markRead(n.id)}
                                        className={`flex items-start gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors ${!n.isRead ? 'bg-accent0/5' : ''}`}>
                                        <div className="mt-1">{typeIcon(n.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm ${!n.isRead ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                                                {!n.isRead && <div className="h-2 w-2 rounded-full bg-accent0" />}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
