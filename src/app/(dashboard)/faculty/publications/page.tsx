'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import facultyService from '@/lib/services/facultyService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, BookOpen, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

interface Publication {
    id: string; title: string; journal: string; year: number; type: string; citations?: number; doi?: string; indexing?: string;
}

export default function PublicationsPage() {
    const [pubs, setPubs] = useState<Publication[]>([]);
    const [loading, setLoading] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [adding, setAdding] = useState(false);
    const [form, setForm] = useState({ title: '', journal: '', year: new Date().getFullYear(), type: 'JOURNAL', doi: '', indexing: 'SCOPUS' });

    const fetchPubs = async () => {
        try {
            const res = await facultyService.getPublications();
            const d = res.data as unknown as Record<string, unknown>;
            setPubs((d.data as Publication[]) || []);
        } catch { toast.error('Failed to load publications'); } finally { setLoading(false); }
    };
    useEffect(() => { fetchPubs(); }, []);

    const handleAdd = async () => {
        if (!form.title || !form.journal) { toast.error('Fill required fields'); return; }
        setAdding(true);
        try {
            await facultyService.addPublication(form);
            toast.success('Publication added');
            setAddOpen(false);
            setForm({ title: '', journal: '', year: new Date().getFullYear(), type: 'JOURNAL', doi: '', indexing: 'SCOPUS' });
            fetchPubs();
        } catch { toast.error('Failed'); } finally { setAdding(false); }
    };

    const handleDelete = async (id: string) => {
        try { await facultyService.deletePublication(id); toast.success('Deleted'); fetchPubs(); } catch { toast.error('Failed'); }
    };

    if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-80" /></div>;

    return (
        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">Publications</h1><p className="text-muted-foreground mt-1">{pubs.length} publication{pubs.length !== 1 ? 's' : ''}</p></div>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                    <DialogTrigger asChild><Button className="bg-foreground text-background hover:bg-foreground/90"><Plus className="mr-2 h-4 w-4" />Add Publication</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add Publication</DialogTitle></DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                            <div className="space-y-2"><Label>Journal/Conference *</Label><Input value={form.journal} onChange={e => setForm({ ...form, journal: e.target.value })} /></div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm({ ...form, year: Number(e.target.value) })} /></div>
                                <div className="space-y-2"><Label>Type</Label>
                                    <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="JOURNAL">Journal</SelectItem><SelectItem value="CONFERENCE">Conference</SelectItem><SelectItem value="BOOK_CHAPTER">Book Chapter</SelectItem></SelectContent></Select>
                                </div>
                                <div className="space-y-2"><Label>Indexing</Label>
                                    <Select value={form.indexing} onValueChange={v => setForm({ ...form, indexing: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SCOPUS">Scopus</SelectItem><SelectItem value="WOS">Web of Science</SelectItem><SelectItem value="UGC">UGC</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent></Select>
                                </div>
                            </div>
                            <div className="space-y-2"><Label>DOI (optional)</Label><Input value={form.doi} onChange={e => setForm({ ...form, doi: e.target.value })} /></div>
                            <Button onClick={handleAdd} disabled={adding} className="w-full bg-foreground text-background hover:bg-foreground/90">{adding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : 'Add Publication'}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardContent className="p-0">
                        {pubs.length === 0 ? (
                            <div className="py-16 text-center"><BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-1">No publications yet</h3><p className="text-sm text-muted-foreground">Add your research publications to build your academic profile.</p></div>
                        ) : (
                            <Table><TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Journal</TableHead><TableHead>Year</TableHead><TableHead>Type</TableHead><TableHead>Indexing</TableHead><TableHead></TableHead></TableRow></TableHeader>
                                <TableBody>{pubs.map(p => (
                                    <TableRow key={p.id}><TableCell className="max-w-xs font-medium">{p.title}</TableCell><TableCell>{p.journal}</TableCell><TableCell>{p.year}</TableCell><TableCell><Badge variant="outline">{p.type}</Badge></TableCell><TableCell><Badge variant="secondary">{p.indexing}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button></TableCell></TableRow>
                                ))}</TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
