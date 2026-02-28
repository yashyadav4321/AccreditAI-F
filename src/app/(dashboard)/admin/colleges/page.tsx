'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import adminService from '@/lib/services/adminService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Search, ArrowRight, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

interface College { id: string; name: string; type: string; city: string; state: string; status: string; usersCount?: number; createdAt: string; }

export default function AdminCollegesPage() {
    const [colleges, setColleges] = useState<College[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await adminService.getColleges({ search: search || undefined });
                const d = res.data as unknown as Record<string, unknown>;
                setColleges((d.data as College[]) || (Array.isArray(d) ? d as unknown as College[] : []));
            } catch { toast.error('Failed to load colleges'); } finally { setLoading(false); }
        };
        fetch();
    }, [search]);

    if (loading) return <div className="space-y-6"><Skeleton className="h-10 w-48" /><Skeleton className="h-12" /><Skeleton className="h-80" /></div>;

    return (
        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">Colleges</h1><p className="text-muted-foreground mt-1">{colleges.length} registered institutions</p></div>
            </motion.div>

            <motion.div variants={fadeIn}>
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search colleges..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 max-w-md" /></div>
            </motion.div>

            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardContent className="p-0">
                        {colleges.length === 0 ? (
                            <div className="py-16 text-center"><Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold">No colleges found</h3></div>
                        ) : (
                            <Table>
                                <TableHeader><TableRow><TableHead>College</TableHead><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Status</TableHead><TableHead>Users</TableHead><TableHead>Joined</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                <TableBody>{colleges.map(c => (
                                    <TableRow key={c.id} className="hover:bg-muted/30">
                                        <TableCell><Link href={`/admin/colleges/${c.id}`} className="font-medium hover:text-foreground transition-colors">{c.name}</Link></TableCell>
                                        <TableCell><Badge variant="outline">{c.type}</Badge></TableCell>
                                        <TableCell className="text-muted-foreground">{c.city}, {c.state}</TableCell>
                                        <TableCell><Badge className={`${c.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'} text-white border-0`}>{c.status}</Badge></TableCell>
                                        <TableCell>{c.usersCount ?? '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{format(new Date(c.createdAt), 'MMM d, yyyy')}</TableCell>
                                        <TableCell><Link href={`/admin/colleges/${c.id}`}><Button variant="ghost" size="sm"><ArrowRight className="h-4 w-4" /></Button></Link></TableCell>
                                    </TableRow>
                                ))}</TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
