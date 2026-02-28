'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Calendar, Download, Eye, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { iqacService, Aqar, AqarDeadline } from '@/lib/services/iqacService';

export default function AqarHistoryPage() {
    const [aqars, setAqars] = useState<Aqar[]>([]);
    const [deadline, setDeadline] = useState<AqarDeadline | null>(null);
    const [loading, setLoading] = useState(true);
    const [deadlineInput, setDeadlineInput] = useState('');
    const [deadlineDialogOpen, setDeadlineDialogOpen] = useState(false);
    const router = useRouter();

    const load = async () => {
        try {
            const [aqarRes, deadlineRes] = await Promise.all([
                iqacService.getAqarList(),
                iqacService.getDeadline(),
            ]);
            setAqars(aqarRes.data.data || []);
            setDeadline(deadlineRes.data.data || null);
        } catch { toast.error('Failed to load AQAR history'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSetDeadline = async () => {
        try {
            const res = await iqacService.setDeadline(new Date(deadlineInput).toISOString());
            setDeadline(res.data.data);
            toast.success('Deadline set');
            setDeadlineDialogOpen(false);
        } catch { toast.error('Failed to set deadline'); }
    };

    const getDaysLeft = () => {
        if (!deadline) return null;
        const now = new Date();
        const dl = new Date(deadline.deadline);
        const diff = Math.ceil((dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const daysLeft = getDaysLeft();

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AQAR History</h1>
                        <p className="text-muted-foreground mt-1">View past AQARs and manage submission deadlines</p>
                    </div>
                    <Dialog open={deadlineDialogOpen} onOpenChange={setDeadlineDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Calendar className="h-4 w-4 mr-2" />Set Deadline</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Set AQAR Submission Deadline</DialogTitle>
                                <DialogDescription>Reminders will be sent at 60, 30, 7, and 1 day(s) before the deadline.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-2 py-4">
                                <Label>Deadline Date</Label>
                                <Input type="datetime-local" value={deadlineInput} onChange={e => setDeadlineInput(e.target.value)} />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeadlineDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSetDeadline} disabled={!deadlineInput}>Set Deadline</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* Deadline Banner */}
            {deadline && daysLeft !== null && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <Card className={`border-l-4 ${daysLeft <= 7 ? 'border-l-red-500 bg-red-500/5' : daysLeft <= 30 ? 'border-l-amber-500 bg-amber-500/5' : 'border-l-emerald-500 bg-emerald-500/5'}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {daysLeft <= 7 ? <AlertCircle className="h-5 w-5 text-red-400" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                                <div>
                                    <p className="font-medium">AQAR Submission Deadline</p>
                                    <p className="text-sm text-muted-foreground">{new Date(deadline.deadline).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-3xl font-bold ${daysLeft <= 7 ? 'text-red-400' : daysLeft <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>{daysLeft}</p>
                                <p className="text-xs text-muted-foreground">days left</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* AQAR Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Past AQARs</CardTitle>
                        <CardDescription>{aqars.length} record{aqars.length !== 1 ? 's' : ''}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
                            </div>
                        ) : aqars.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No AQARs generated yet. Use the AQAR Builder to create one.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Academic Year</TableHead>
                                        <TableHead>Version</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Generated By</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {aqars.map(a => (
                                        <TableRow key={a.id}>
                                            <TableCell className="font-medium">{a.academicYear}</TableCell>
                                            <TableCell>v{a.version}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={a.status === 'FINALIZED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
                                                    {a.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{a.generatedByName || '—'}</TableCell>
                                            <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => router.push('/iqac/aqar-builder')}><Eye className="h-4 w-4" /></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
