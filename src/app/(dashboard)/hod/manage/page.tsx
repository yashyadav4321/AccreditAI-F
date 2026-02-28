'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Building2, Loader2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { hodService, HodAccount, DepartmentOverview } from '@/lib/services/hodService';

export default function HodManagePage() {
    const [hods, setHods] = useState<HodAccount[]>([]);
    const [overview, setOverview] = useState<DepartmentOverview[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', departmentId: '' });
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

    const load = async () => {
        try {
            const [hodRes, overviewRes] = await Promise.all([
                hodService.getHodAccounts(),
                hodService.getDepartmentOverview(),
            ]);
            setHods(hodRes.data.data || []);
            const ov = overviewRes.data.data || [];
            setOverview(ov);
            // Extract departments from overview
            setDepartments(ov.map((d: DepartmentOverview) => ({ id: d.departmentId, name: d.departmentName })));
        } catch { toast.error('Failed to load data'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleCreate = async () => {
        try {
            await hodService.createHodAccount(form);
            toast.success('HOD account created');
            setDialogOpen(false);
            setForm({ email: '', password: '', firstName: '', lastName: '', phone: '', departmentId: '' });
            load();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create'); }
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">HOD Management</h1>
                        <p className="text-muted-foreground mt-1">Manage department heads and track data collection</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add HOD</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Create HOD Account</DialogTitle><DialogDescription>The HOD will get access to their department portal.</DialogDescription></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2"><Label>First Name *</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} /></div>
                                    <div className="grid gap-2"><Label>Last Name *</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} /></div>
                                </div>
                                <div className="grid gap-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                                <div className="grid gap-2"><Label>Department *</Label>
                                    <Select value={form.departmentId} onValueChange={v => setForm({ ...form, departmentId: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter><Button onClick={handleCreate} disabled={!form.email || !form.password || !form.departmentId}>Create</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* Department Overview */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <Card>
                    <CardHeader><CardTitle>Department Overview</CardTitle><CardDescription>Task completion across departments</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                        {loading ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : overview.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No departments found</p>
                        ) : overview.map(d => (
                            <div key={d.departmentId} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                                <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-blue-500/20">
                                    <Building2 className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm">{d.departmentName}</p>
                                        {d.hod ? (
                                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400">{d.hod.firstName} {d.hod.lastName}</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400">No HOD</Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Progress value={d.completionPercent} className="h-1.5 flex-1" />
                                        <span className="text-xs text-muted-foreground">{d.completedTasks}/{d.totalTasks}</span>
                                    </div>
                                </div>
                                <Badge variant="outline">{d.completionPercent}%</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* HOD Accounts Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card>
                    <CardHeader><CardTitle>HOD Accounts</CardTitle><CardDescription>{hods.length} account{hods.length !== 1 ? 's' : ''}</CardDescription></CardHeader>
                    <CardContent>
                        {hods.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No HOD accounts yet.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader><TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                </TableRow></TableHeader>
                                <TableBody>
                                    {hods.map(h => (
                                        <TableRow key={h.id}>
                                            <TableCell className="font-medium">{h.firstName} {h.lastName}</TableCell>
                                            <TableCell>{h.email}</TableCell>
                                            <TableCell><Badge variant="outline">{h.department?.name || '—'}</Badge></TableCell>
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
