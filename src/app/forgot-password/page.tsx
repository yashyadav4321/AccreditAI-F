'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import authService from '@/lib/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await authService.forgotPassword({ email: data.email });
            setIsSent(true);
            toast.success('Reset instructions sent to your email');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-background">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-foreground bg-clip-text text-transparent">AccreditAI</span>
                </div>
                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="space-y-1 pb-4 text-center">
                        <h1 className="text-2xl font-bold">Forgot password?</h1>
                        <p className="text-sm text-muted-foreground">
                            {isSent ? 'Check your email for the reset OTP' : "Enter your email and we'll send you reset instructions"}
                        </p>
                    </CardHeader>
                    <CardContent>
                        {isSent ? (
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">We&apos;ve sent a reset OTP to your email.</p>
                                <Link href="/reset-password">
                                    <Button className="w-full bg-foreground text-background hover:bg-foreground/90">Enter Reset Code</Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" placeholder="you@college.edu" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                                </div>
                                <Button type="submit" disabled={isSubmitting} className="w-full bg-foreground text-background hover:bg-foreground/90 h-11">
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Reset Instructions'}
                                </Button>
                            </form>
                        )}
                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                                <ArrowLeft className="h-3.5 w-3.5" /> Back to login
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
