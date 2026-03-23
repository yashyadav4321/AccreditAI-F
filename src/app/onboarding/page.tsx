'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import collegeService from '@/lib/services/collegeService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Building2, Users, Target, ArrowRight, ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const step1Schema = z.object({
    collegeName: z.string().min(3, 'College name is required'),
    type: z.string().min(1, 'Select college type'),
    university: z.string().min(2, 'University name is required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
    website: z.string().optional(),
    phone: z.string().optional(),
    establishedYear: z.string().optional(),
});

type Step1Data = z.infer<typeof step1Schema>;

const STEPS = [
    { title: 'College Info', icon: Building2, description: 'Basic institution details' },
    { title: 'Departments', icon: Users, description: 'Add departments' },
    { title: 'Frameworks', icon: Target, description: 'Select accreditation targets' },
];

const COLLEGE_TYPES = ['Autonomous', 'Affiliated', 'Deemed University', 'Central University', 'State University', 'Private University'];
const INDIAN_STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh', 'Puducherry'];

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [departments, setDepartments] = useState<{ name: string; code: string }[]>([]);
    const [deptName, setDeptName] = useState('');
    const [deptCode, setDeptCode] = useState('');
    const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
    });

    const [collegeData, setCollegeData] = useState<Step1Data | null>(null);

    const handleStep1 = (data: Step1Data) => {
        setCollegeData(data);
        setStep(1);
    };

    const addDepartment = () => {
        if (!deptName || !deptCode) { toast.error('Fill both department name and code'); return; }
        setDepartments([...departments, { name: deptName, code: deptCode }]);
        setDeptName('');
        setDeptCode('');
    };

    const removeDepartment = (i: number) => setDepartments(departments.filter((_, idx) => idx !== i));

    const toggleFramework = (fw: string) => {
        setSelectedFrameworks(prev => prev.includes(fw) ? prev.filter(f => f !== fw) : [...prev, fw]);
    };

    const handleComplete = async () => {
        if (!collegeData) return;
        if (selectedFrameworks.length === 0) { toast.error('Select at least one framework'); return; }
        setIsSubmitting(true);
        try {
            // Remap frontend field names to match backend API schema
            const response = await collegeService.completeOnboarding({
                name: collegeData.collegeName,
                type: collegeData.type,
                affiliation: collegeData.university,
                location: collegeData.address,
                city: collegeData.city,
                state: collegeData.state,
                pincode: collegeData.pincode,
                website: collegeData.website || '',
                phone: collegeData.phone,
                establishedYear: collegeData.establishedYear ? Number(collegeData.establishedYear) : undefined,
                frameworks: selectedFrameworks,
            });

            // Add departments individually after college is created
            const payload = (response.data as any)?.data || response.data;
            const collegeId = payload?.college?.id || payload?.id;
            if (collegeId && departments.length > 0) {
                await Promise.all(
                    departments.map(dept => collegeService.addDepartment(collegeId, dept))
                );
            }

            // Save the fresh tokens that include the new collegeId
            if (payload?.accessToken) {
                localStorage.setItem('accreditai_token', payload.accessToken);
            }
            if (payload?.refreshToken) {
                localStorage.setItem('accreditai_refresh_token', payload.refreshToken);
            }

            toast.success('Onboarding complete! Welcome to AccreditAI.');
            router.push('/dashboard');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
            const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Onboarding failed';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const progress = ((step + 1) / STEPS.length) * 100;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                            <img src="/Accreditailogo.jpg" alt="AccreditAI Logo" className="h-full w-full object-contain" />
                        </div>
                        <span className="text-lg font-bold bg-foreground bg-clip-text text-transparent">AccreditAI</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Step {step + 1} of {STEPS.length}</span>
                </div>
                <Progress value={progress} className="h-1" />
            </div>

            <div className="flex-1 flex items-start justify-center p-8">
                <div className="w-full max-w-3xl">
                    {/* Step Indicators */}
                    <div className="flex items-center justify-center gap-8 mb-10">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.title} className={`flex items-center gap-2 ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${i <= step ? 'bg-accent text-foreground' : 'bg-muted'}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="hidden sm:block">
                                        <p className="text-sm font-medium">{s.title}</p>
                                        <p className="text-xs text-muted-foreground">{s.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <Card className="border-border/50 shadow-xl">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold mb-6">Tell us about your institution</h2>
                                        <form onSubmit={handleSubmit(handleStep1)} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>College Name *</Label>
                                                <Input placeholder="e.g., ABC College of Engineering" {...register('collegeName')} className={errors.collegeName ? 'border-red-500' : ''} />
                                                {errors.collegeName && <p className="text-xs text-red-500">{errors.collegeName.message}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>College Type *</Label>
                                                    <Select onValueChange={v => setValue('type', v)}>
                                                        <SelectTrigger className={errors.type ? 'border-red-500' : ''}><SelectValue placeholder="Select type" /></SelectTrigger>
                                                        <SelectContent>{COLLEGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                    {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>University *</Label>
                                                    <Input placeholder="Affiliated university" {...register('university')} className={errors.university ? 'border-red-500' : ''} />
                                                    {errors.university && <p className="text-xs text-red-500">{errors.university.message}</p>}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Address *</Label>
                                                <Input placeholder="Full address" {...register('address')} className={errors.address ? 'border-red-500' : ''} />
                                                {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>City *</Label>
                                                    <Input placeholder="City" {...register('city')} className={errors.city ? 'border-red-500' : ''} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>State *</Label>
                                                    <Select onValueChange={v => setValue('state', v)}>
                                                        <SelectTrigger><SelectValue placeholder="State" /></SelectTrigger>
                                                        <SelectContent>{INDIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Pincode *</Label>
                                                    <Input placeholder="600001" {...register('pincode')} className={errors.pincode ? 'border-red-500' : ''} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Website</Label>
                                                    <Input placeholder="https://..." {...register('website')} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Phone</Label>
                                                    <Input placeholder="+91..." {...register('phone')} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Established Year</Label>
                                                    <Input placeholder="1990" {...register('establishedYear')} />
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-4">
                                                <Button type="submit" className="bg-foreground text-background hover:bg-foreground/90">
                                                    Next <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <Card className="border-border/50 shadow-xl">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold mb-2">Add departments</h2>
                                        <p className="text-sm text-muted-foreground mb-6">Add the departments in your institution. You can add more later.</p>
                                        <div className="flex gap-3 mb-4">
                                            <Input placeholder="Department name" value={deptName} onChange={e => setDeptName(e.target.value)} className="flex-1" />
                                            <Input placeholder="Code (e.g. CSE)" value={deptCode} onChange={e => setDeptCode(e.target.value)} className="w-32" />
                                            <Button type="button" onClick={addDepartment} variant="outline"><Plus className="h-4 w-4" /></Button>
                                        </div>
                                        {departments.length > 0 && (
                                            <div className="space-y-2 mb-6">
                                                {departments.map((d, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                        <div><span className="font-medium">{d.name}</span> <span className="text-muted-foreground text-sm">({d.code})</span></div>
                                                        <Button variant="ghost" size="sm" onClick={() => removeDepartment(i)}><X className="h-4 w-4" /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-4">
                                            <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                                            <Button onClick={() => setStep(2)} className="bg-foreground text-background hover:bg-foreground/90">Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <Card className="border-border/50 shadow-xl">
                                    <CardContent className="p-8">
                                        <h2 className="text-2xl font-bold mb-2">Select frameworks</h2>
                                        <p className="text-sm text-muted-foreground mb-6">Choose which accreditation frameworks you want to prepare for.</p>
                                        <div className="space-y-4">
                                            {[
                                                { id: 'NAAC', name: 'NAAC', desc: 'National Assessment and Accreditation Council — 7 criteria framework for institutional quality', color: 'from-foreground/80 to-foreground' },
                                                { id: 'NBA', name: 'NBA', desc: 'National Board of Accreditation — Program-level accreditation with outcome-based assessment', color: 'from-neutral-700 to-neutral-900' },
                                                { id: 'NIRF', name: 'NIRF', desc: 'National Institutional Ranking Framework — 5 parameter ranking system', color: 'from-amber-500 to-orange-600' },
                                            ].map(fw => (
                                                <div key={fw.id} onClick={() => toggleFramework(fw.id)}
                                                    className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedFrameworks.includes(fw.id) ? 'border-border bg-accent0/5' : 'border-border hover:border-border/80'}`}>
                                                    <div className="flex items-start gap-4">
                                                        <Checkbox checked={selectedFrameworks.includes(fw.id)} />
                                                        <div>
                                                            <h3 className="font-semibold text-lg">{fw.name}</h3>
                                                            <p className="text-sm text-muted-foreground mt-1">{fw.desc}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between pt-6">
                                            <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                                            <Button onClick={handleComplete} disabled={isSubmitting} className="bg-foreground text-background hover:bg-foreground/90">
                                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Setting up...</> : <>Complete Setup <Sparkles className="ml-2 h-4 w-4" /></>}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
