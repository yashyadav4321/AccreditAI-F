'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import authService from '@/lib/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
    email: z.string().email('Enter a valid email'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match', path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await authService.resetPassword({ email: data.email, otp: data.otp, newPassword: data.newPassword });
            toast.success('Password reset successfully! Please log in.');
            router.push('/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-background">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden p-0.5">
                        <img src="/Accreditailogo.jpg" alt="AccreditAI Logo" className="h-full w-full object-contain" />
                    </div>
                    <span className="text-xl font-bold bg-foreground bg-clip-text text-transparent">AccreditAI</span>
                </div>
                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="space-y-1 pb-4 text-center">
                        <h1 className="text-2xl font-bold">Reset password</h1>
                        <p className="text-sm text-muted-foreground">Enter the OTP from your email and your new password</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="you@college.edu" {...register('email')} className={errors.email ? 'border-red-500' : ''} />
                                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="otp">OTP Code</Label>
                                <Input id="otp" placeholder="123456" maxLength={6} {...register('otp')} className={errors.otp ? 'border-red-500' : ''} />
                                {errors.otp && <p className="text-xs text-red-500">{errors.otp.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input id="newPassword" type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" {...register('newPassword')} className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" type="password" placeholder="Re-enter password" {...register('confirmPassword')} className={errors.confirmPassword ? 'border-red-500' : ''} />
                                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full bg-foreground text-background hover:bg-foreground/90 h-11">
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : 'Reset Password'}
                            </Button>
                        </form>
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
