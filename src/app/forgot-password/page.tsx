'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import authService from '@/lib/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, ArrowLeft, CheckCircle2, Mail, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

// ── Step 1: Email ──
const emailSchema = z.object({
    email: z.string().email('Enter a valid email'),
});
type EmailFormData = z.infer<typeof emailSchema>;

// ── Step 2: OTP ──
const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits'),
});
type OtpFormData = z.infer<typeof otpSchema>;

// ── Step 3: New Password ──
const passwordSchema = z.object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});
type PasswordFormData = z.infer<typeof passwordSchema>;

type Step = 'email' | 'otp' | 'password' | 'done';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // ── Step 1: Send Reset Code ──
    const emailForm = useForm<EmailFormData>({ resolver: zodResolver(emailSchema) });

    const onEmailSubmit = async (data: EmailFormData) => {
        setIsSubmitting(true);
        try {
            const response = await authService.forgotPassword({ email: data.email });
            const resData = (response as { data?: { data?: { maskedEmail?: string } } })?.data?.data;
            setMaskedEmail(resData?.maskedEmail || null);
            setEmail(data.email);
            setStep('otp');
            toast.success('Reset code sent to your email');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Step 2: Verify OTP against backend ──
    const otpForm = useForm<OtpFormData>({ resolver: zodResolver(otpSchema) });

    const onOtpSubmit = async (data: OtpFormData) => {
        setIsSubmitting(true);
        try {
            await authService.verifyResetOtp({ email, otp: data.otp });
            setOtp(data.otp);
            setStep('password');
            toast.success('Code verified!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Invalid code');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Step 3: Reset Password ──
    const passwordForm = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

    const onPasswordSubmit = async (data: PasswordFormData) => {
        setIsSubmitting(true);
        try {
            await authService.resetPassword({ email, otp, newPassword: data.newPassword });
            setStep('done');
            toast.success('Password reset successfully!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepTitles: Record<Step, { heading: string; sub: string }> = {
        email: { heading: 'Forgot password?', sub: "Enter your email and we'll send you a reset code" },
        otp: { heading: 'Enter reset code', sub: 'Check your email for the 6-digit code' },
        password: { heading: 'Set new password', sub: 'Choose a strong password for your account' },
        done: { heading: 'All done!', sub: 'Your password has been reset successfully' },
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

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    {(['email', 'otp', 'password'] as const).map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full transition-colors ${
                                step === s ? 'bg-foreground scale-125' :
                                (['email', 'otp', 'password'].indexOf(step) > i || step === 'done') ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                            }`} />
                            {i < 2 && <div className={`w-8 h-0.5 transition-colors ${
                                (['email', 'otp', 'password'].indexOf(step) > i || step === 'done') ? 'bg-emerald-500' : 'bg-muted-foreground/20'
                            }`} />}
                        </div>
                    ))}
                </div>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="space-y-1 pb-4 text-center">
                        <h1 className="text-2xl font-bold">{stepTitles[step].heading}</h1>
                        <p className="text-sm text-muted-foreground">{stepTitles[step].sub}</p>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            {/* ── Step 1: Email ── */}
                            {step === 'email' && (
                                <motion.form key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" type="email" placeholder="you@college.edu" {...emailForm.register('email')} className={emailForm.formState.errors.email ? 'border-red-500' : ''} />
                                        {emailForm.formState.errors.email && <p className="text-xs text-red-500">{emailForm.formState.errors.email.message}</p>}
                                    </div>
                                    <Button type="submit" disabled={isSubmitting} className="w-full bg-foreground text-background hover:bg-foreground/90 h-11">
                                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Reset Code'}
                                    </Button>
                                </motion.form>
                            )}

                            {/* ── Step 2: OTP ── */}
                            {step === 'otp' && (
                                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                    {maskedEmail && (
                                        <div className="flex items-center justify-center gap-2 bg-muted/50 rounded-lg px-4 py-3">
                                            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <p className="text-sm text-muted-foreground">
                                                Code sent to <span className="font-semibold text-foreground">{maskedEmail}</span>
                                            </p>
                                        </div>
                                    )}
                                    <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="otp">6-Digit Code</Label>
                                            <Input id="otp" placeholder="123456" maxLength={6} {...otpForm.register('otp')} className={`text-center text-lg tracking-widest ${otpForm.formState.errors.otp ? 'border-red-500' : ''}`} />
                                            {otpForm.formState.errors.otp && <p className="text-xs text-red-500">{otpForm.formState.errors.otp.message}</p>}
                                        </div>
                                        <Button type="submit" disabled={isSubmitting} className="w-full bg-foreground text-background hover:bg-foreground/90 h-11">
                                            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Verifying...</> : 'Verify Code'}
                                        </Button>
                                    </form>
                                </motion.div>
                            )}

                            {/* ── Step 3: New Password ── */}
                            {step === 'password' && (
                                <motion.form key="password" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <div className="relative">
                                            <Input id="newPassword" type={showPassword ? 'text' : 'password'} placeholder="Min 8 characters" {...passwordForm.register('newPassword')} className={passwordForm.formState.errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'} />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        {passwordForm.formState.errors.newPassword && <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input id="confirmPassword" type="password" placeholder="Re-enter password" {...passwordForm.register('confirmPassword')} className={passwordForm.formState.errors.confirmPassword ? 'border-red-500' : ''} />
                                        {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>}
                                    </div>
                                    <Button type="submit" disabled={isSubmitting} className="w-full bg-foreground text-background hover:bg-foreground/90 h-11">
                                        {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : 'Reset Password'}
                                    </Button>
                                </motion.form>
                            )}

                            {/* ── Done ── */}
                            {step === 'done' && (
                                <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
                                    <div className="flex justify-center">
                                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Your password has been updated. You can now sign in with your new password.</p>
                                    <Button onClick={() => router.push('/login')} className="w-full bg-foreground text-background hover:bg-foreground/90">
                                        Back to Login
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {step !== 'done' && (
                            <div className="mt-6 text-center">
                                <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                                    <ArrowLeft className="h-3.5 w-3.5" /> Back to login
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
