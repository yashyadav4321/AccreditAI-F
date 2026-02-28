'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Pencil, Trash2, Mail, Phone, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { iqacService, IqacMember } from '@/lib/services/iqacService';

const roles = [
    { value: 'CHAIRPERSON', label: 'Chairperson', color: 'bg-amber-500/20 text-amber-400' },
    { value: 'MEMBER_SECRETARY', label: 'Member Secretary', color: 'bg-blue-500/20 text-blue-400' },
    { value: 'MEMBER', label: 'Member', color: 'bg-emerald-500/20 text-emerald-400' },
    { value: 'EXTERNAL_MEMBER', label: 'External Member', color: 'bg-purple-500/20 text-purple-400' },
];

const emptyForm = { name: '', designation: '', iqacRole: 'MEMBER', department: '', email: '', phone: '' };

export default function IqacCommitteePage() {
    const [members, setMembers] = useState<IqacMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [form, setForm] = useState(emptyForm);

    const load = async () => {
        try {
            const res = await iqacService.getMembers();
            setMembers(res.data.data || []);
        } catch { toast.error('Failed to load members'); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleSubmit = async () => {
        try {
            if (editing) {
                await iqacService.updateMember(editing, form);
                toast.success('Member updated');
            } else {
                await iqacService.createMember(form);
                toast.success('Member added');
            }
            setDialogOpen(false);
            setEditing(null);
            setForm(emptyForm);
            load();
        } catch { toast.error('Failed to save member'); }
    };

    const handleEdit = (m: IqacMember) => {
        setForm({ name: m.name, designation: m.designation, iqacRole: m.iqacRole, department: m.department || '', email: m.email, phone: m.phone || '' });
        setEditing(m.id);
        setDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Remove this member?')) return;
        try {
            await iqacService.deleteMember(id);
            toast.success('Member removed');
            load();
        } catch { toast.error('Failed to remove'); }
    };

    const getRoleBadge = (role: string) => {
        const r = roles.find(r => r.value === role);
        return <Badge variant="outline" className={r?.color}>{r?.label || role}</Badge>;
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">IQAC Committee</h1>
                        <p className="text-muted-foreground mt-1">Manage Internal Quality Assurance Cell members</p>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditing(null); setForm(emptyForm); } }}>
                        <DialogTrigger asChild>
                            <Button><Plus className="h-4 w-4 mr-2" />Add Member</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>{editing ? 'Edit Member' : 'Add Member'}</DialogTitle>
                                <DialogDescription>Fill in the member details below.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Full Name *</Label>
                                    <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Dr. John Doe" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Designation *</Label>
                                    <Input value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="Professor & Head" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>IQAC Role *</Label>
                                    <Select value={form.iqacRole} onValueChange={v => setForm({ ...form, iqacRole: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {roles.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Department</Label>
                                    <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Email *</Label>
                                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@college.edu" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Phone</Label>
                                    <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSubmit} disabled={!form.name || !form.email}>{editing ? 'Update' : 'Add'}</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {roles.map(r => {
                        const count = members.filter(m => m.iqacRole === r.value).length;
                        return (
                            <Card key={r.value} className="bg-card/50 backdrop-blur">
                                <CardContent className="p-4 flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${r.color}`}>
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{count}</p>
                                        <p className="text-xs text-muted-foreground">{r.label}{count !== 1 ? 's' : ''}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card>
                    <CardHeader>
                        <CardTitle>Committee Members</CardTitle>
                        <CardDescription>{members.length} member{members.length !== 1 ? 's' : ''}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
                            </div>
                        ) : members.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No committee members yet. Add your first member.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Designation</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.map(m => (
                                        <TableRow key={m.id}>
                                            <TableCell className="font-medium">{m.name}</TableCell>
                                            <TableCell>{m.designation}</TableCell>
                                            <TableCell>{getRoleBadge(m.iqacRole)}</TableCell>
                                            <TableCell>{m.department || '—'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>
                                                    {m.phone && <span className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(m)}><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
