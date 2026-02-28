'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import documentService from '@/lib/services/documentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, Trash2, Eye, Search, Download, Loader2, FolderOpen } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

interface Document {
    id: string;
    name: string;
    type: string;
    size: number;
    framework?: string;
    uploadedBy?: string;
    createdAt: string;
    url?: string;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterFramework, setFilterFramework] = useState('ALL');
    const [uploadOpen, setUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchDocuments = useCallback(async () => {
        try {
            const res = await documentService.list({ search: searchQuery || undefined, framework: filterFramework !== 'ALL' ? filterFramework : undefined });
            const d = res.data as unknown as Record<string, unknown>;
            setDocuments((d.data as Document[]) || (Array.isArray(d) ? d as unknown as Document[] : []));
        } catch { toast.error('Failed to load documents'); } finally { setLoading(false); }
    }, [searchQuery, filterFramework]);

    useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        setUploading(true);
        try {
            await documentService.upload(formData);
            toast.success('Document uploaded successfully');
            setUploadOpen(false);
            fetchDocuments();
        } catch { toast.error('Upload failed'); } finally { setUploading(false); }
    };

    const handleDelete = async (id: string) => {
        try {
            await documentService.delete(id);
            toast.success('Document deleted');
            fetchDocuments();
        } catch { toast.error('Delete failed'); }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">
            <motion.div variants={fadeIn} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Document Vault</h1>
                    <p className="text-muted-foreground mt-1">Upload and manage accreditation documents</p>
                </div>
                <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-foreground text-background hover:bg-foreground/90"><Upload className="mr-2 h-4 w-4" />Upload Document</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-2"><Label>File</Label><Input type="file" name="file" required /></div>
                            <div className="space-y-2"><Label>Framework (optional)</Label>
                                <select name="framework" className="w-full border rounded-md p-2 bg-background">
                                    <option value="">General</option><option value="NAAC">NAAC</option><option value="NBA">NBA</option><option value="NIRF">NIRF</option>
                                </select>
                            </div>
                            <div className="space-y-2"><Label>Description (optional)</Label><Input name="description" placeholder="Brief description..." /></div>
                            <Button type="submit" disabled={uploading} className="w-full bg-foreground text-background hover:bg-foreground/90">
                                {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : 'Upload'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* Filters */}
            <motion.div variants={fadeIn} className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Select value={filterFramework} onValueChange={setFilterFramework}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Framework" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All</SelectItem><SelectItem value="NAAC">NAAC</SelectItem><SelectItem value="NBA">NBA</SelectItem><SelectItem value="NIRF">NIRF</SelectItem>
                    </SelectContent>
                </Select>
            </motion.div>

            {/* Documents Table */}
            <motion.div variants={fadeIn}>
                <Card className="border-border/50">
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
                        ) : documents.length === 0 ? (
                            <div className="py-16 text-center">
                                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-1">No documents found</h3>
                                <p className="text-sm text-muted-foreground">Upload your first document to get started.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead><TableHead>Framework</TableHead><TableHead>Size</TableHead><TableHead>Uploaded</TableHead><TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map(doc => (
                                        <TableRow key={doc.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-5 w-5 text-foreground shrink-0" />
                                                    <span className="font-medium">{doc.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{doc.framework ? <Badge variant="secondary">{doc.framework}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                                            <TableCell className="text-muted-foreground">{formatFileSize(doc.size)}</TableCell>
                                            <TableCell className="text-muted-foreground">{format(new Date(doc.createdAt), 'MMM d, yyyy')}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {doc.url && <Button variant="ghost" size="sm" asChild><a href={doc.url} target="_blank"><Eye className="h-4 w-4" /></a></Button>}
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
