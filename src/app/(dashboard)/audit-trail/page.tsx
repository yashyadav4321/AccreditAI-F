'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import auditService, { AuditLog, AuditLogResponse } from '@/lib/services/auditService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Search, ChevronLeft, ChevronRight, User, Clock, Edit3, Plus, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
    CREATE: { icon: <Plus className="h-4 w-4" />, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    UPDATE: { icon: <Edit3 className="h-4 w-4" />, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    DELETE: { icon: <Trash2 className="h-4 w-4" />, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

export default function AuditTrailPage() {
    const [data, setData] = useState<AuditLogResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [entityFilter, setEntityFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [entityTypes, setEntityTypes] = useState<string[]>([]);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = { page, limit: 25 };
            if (entityFilter) params.entity = entityFilter;
            if (actionFilter) params.action = actionFilter;
            if (search) params.search = search;

            const res = await auditService.getLogs(params);
            const d = res.data as unknown as Record<string, unknown>;
            setData((d.data as AuditLogResponse) || (res.data as unknown as AuditLogResponse));
        } catch {
            toast.error('Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    }, [page, entityFilter, actionFilter, search]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    useEffect(() => {
        auditService.getEntityTypes().then((res) => {
            const d = res.data as unknown as Record<string, unknown>;
            setEntityTypes((d.data as string[]) || (res.data as unknown as string[]));
        }).catch(() => { });
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (loading && !data) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-16 w-full" />
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
        );
    }

    const logs = data?.logs || [];
    const pagination = data?.pagination || { page: 1, limit: 25, total: 0, totalPages: 1 };

    return (
        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <History className="h-8 w-8" />
                        Audit Trail
                    </h1>
                    <p className="text-muted-foreground mt-1">Track all changes made across the platform</p>
                </div>
                <Badge variant="outline" className="text-sm px-3 py-1">
                    {pagination.total} entries
                </Badge>
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs..."
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    className="pl-9"
                                />
                            </div>
                            <select
                                value={entityFilter}
                                onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
                                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">All Entities</option>
                                {entityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <select
                                value={actionFilter}
                                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">All Actions</option>
                                <option value="CREATE">Created</option>
                                <option value="UPDATE">Updated</option>
                                <option value="DELETE">Deleted</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Logs */}
            <motion.div variants={stagger} className="space-y-3">
                {logs.length === 0 ? (
                    <motion.div variants={fadeIn}>
                        <Card className="border-border/50">
                            <CardContent className="p-12 text-center">
                                <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                <h3 className="text-lg font-medium">No audit logs yet</h3>
                                <p className="text-sm text-muted-foreground mt-1">Activity will appear here as changes are made</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : logs.map((log) => {
                    const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.UPDATE;
                    const isExpanded = expandedId === log.id;

                    return (
                        <motion.div key={log.id} variants={fadeIn}>
                            <Card
                                className="border-border/50 hover:border-border transition-all cursor-pointer"
                                onClick={() => setExpandedId(isExpanded ? null : log.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.color}`}>
                                            {config.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Badge variant="outline" className={config.color}>{log.action}</Badge>
                                                <span className="font-medium">{log.entity}</span>
                                                {log.entityId && (
                                                    <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                                                        {log.entityId.slice(0, 8)}...
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3.5 w-3.5" />
                                                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDate(log.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                        <Eye className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>
                                    {isExpanded && (log.oldData || log.newData) && (
                                        <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {log.oldData && (
                                                <div>
                                                    <p className="text-xs font-medium text-red-400 mb-2">Previous Value</p>
                                                    <pre className="text-xs bg-red-500/5 p-3 rounded-lg overflow-auto max-h-48 border border-red-500/10">
                                                        {JSON.stringify(log.oldData, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                            {log.newData && (
                                                <div>
                                                    <p className="text-xs font-medium text-emerald-400 mb-2">New Value</p>
                                                    <pre className="text-xs bg-emerald-500/5 p-3 rounded-lg overflow-auto max-h-48 border border-emerald-500/10">
                                                        {JSON.stringify(log.newData, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <motion.div variants={fadeIn} className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
                    </p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
