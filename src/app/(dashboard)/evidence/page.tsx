'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Tag, Trash2, Search, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { evidenceService, EvidenceTag, CoverageScore } from '@/lib/services/evidenceService';

export default function EvidenceTagsPage() {
    const [tags, setTags] = useState<EvidenceTag[]>([]);
    const [coverage, setCoverage] = useState<CoverageScore | null>(null);
    const [loading, setLoading] = useState(true);
    const [tagDialogOpen, setTagDialogOpen] = useState(false);
    const [form, setForm] = useState({ documentId: '', framework: 'NAAC', criterionRef: '', module: '' });
    const [filterCriterion, setFilterCriterion] = useState('');

    const load = async () => {
        try {
            const [tagRes, covRes] = await Promise.all([
                filterCriterion ? evidenceService.getTagsByCriterion('NAAC', filterCriterion) : evidenceService.getTagsByModule('NAAC'),
                evidenceService.getCoverageScore(),
            ]);
            setTags(tagRes.data.data || []);
            setCoverage(covRes.data.data || null);
        } catch { /* silent first load */ }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [filterCriterion]);

    const handleTag = async () => {
        try {
            await evidenceService.tagDocument({ documentId: form.documentId, module: form.module || form.framework, criterionId: form.criterionRef, criterionRef: form.criterionRef });
            toast.success('Document tagged');
            setTagDialogOpen(false);
            setForm({ documentId: '', framework: 'NAAC', criterionRef: '', module: '' });
            load();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to tag'); }
    };

    const handleUntag = async (id: string) => {
        try {
            await evidenceService.untagDocument(id);
            toast.success('Tag removed');
            load();
        } catch { toast.error('Failed to remove tag'); }
    };

    const frameworkColors: Record<string, string> = {
        NAAC: 'bg-blue-500/20 text-blue-400',
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Evidence Tags</h1>
                        <p className="text-muted-foreground mt-1">Tag documents as evidence for accreditation criteria</p>
                    </div>
                    <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                        <DialogTrigger asChild><Button><Tag className="h-4 w-4 mr-2" />Tag Document</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Tag Document as Evidence</DialogTitle></DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2"><Label>Document ID *</Label><Input value={form.documentId} onChange={e => setForm({ ...form, documentId: e.target.value })} placeholder="Paste document ID" /></div>
                                <div className="grid gap-2"><Label>Framework *</Label>
                                    <Select value={form.framework} onValueChange={v => setForm({ ...form, framework: v })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NAAC">NAAC</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2"><Label>Criterion Reference *</Label><Input value={form.criterionRef} onChange={e => setForm({ ...form, criterionRef: e.target.value })} placeholder="e.g. 2.3.1 or PO-1" /></div>
                                <div className="grid gap-2"><Label>Source Module</Label><Input value={form.module} onChange={e => setForm({ ...form, module: e.target.value })} placeholder="e.g. SSS, NIRF, IQAC" /></div>
                            </div>
                            <DialogFooter><Button onClick={handleTag} disabled={!form.documentId || !form.criterionRef}>Tag</Button></DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            {/* Coverage Overview */}
            {coverage && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        {([{ framework: 'NAAC', data: coverage.naac, total: coverage.naac?.totalCriteria }] as { framework: string; data: { coverage: number; tagged: number } | undefined; total: number | undefined }[]).filter(fw => fw.data).map(fw => (
                            <Card key={fw.framework} className="bg-card/50 backdrop-blur">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge variant="outline" className={frameworkColors[fw.framework]}>{fw.framework}</Badge>
                                        <span className="text-2xl font-bold">{fw.data?.coverage || 0}%</span>
                                    </div>
                                    <Progress value={fw.data?.coverage || 0} className="h-2 mb-2" />
                                    <p className="text-xs text-muted-foreground">{fw.data?.tagged || 0}/{fw.total || 0} criteria covered</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Filter & Tags List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Tagged Documents</CardTitle>
                                <CardDescription>{tags.length} evidence tag{tags.length !== 1 ? 's' : ''}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    placeholder="Filter by criterion..."
                                    value={filterCriterion}
                                    onChange={e => setFilterCriterion(e.target.value)}
                                    className="w-48"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : tags.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Link2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                <p className="text-sm">No evidence tags found. Tag documents to criteria above.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tags.map(t => (
                                    <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{(t.document as any)?.name || t.documentId}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className={`text-[10px] ${frameworkColors[t.module]}`}>{t.module}</Badge>
                                                <Badge variant="outline" className="text-[10px]">{t.criterionRef}</Badge>
                                                {t.module && <Badge variant="outline" className="text-[10px]">{t.module}</Badge>}
                                            </div>
                                        </div>
                                        <span className="text-xs text-muted-foreground">{new Date(t.taggedAt).toLocaleDateString()}</span>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => handleUntag(t.id)}>
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
