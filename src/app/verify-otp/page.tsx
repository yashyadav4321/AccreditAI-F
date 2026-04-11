'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import authService from '@/lib/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value[value.length - 1];
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP');
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.verifyOtp({ email, otp: otpString });
            toast.success('Email verified successfully! Please log in.');
            router.push('/login');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        try {
            await authService.resendOtp({ email });
            setResendTimer(60);
            toast.success('OTP resent to your email');
        } catch {
            toast.error('Failed to resend OTP');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-background">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-foreground/5 via-transparent to-transparent" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden p-0.5">
                        <>
                            <img src="/logo-black-bg.jpg" alt="AccreditAI Logo" className="h-full w-full object-contain dark:hidden" />
                            <img src="/logo-white-bg.jpg" alt="AccreditAI Logo" className="h-full w-full object-contain hidden dark:block" />
                        </>
                    </div>
                    <span className="text-xl font-bold bg-foreground bg-clip-text text-transparent">
                        AccreditAI
                    </span>
                </div>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="space-y-1 pb-4 text-center">
                        <h1 className="text-2xl font-bold">Verify your email</h1>
                        <p className="text-sm text-muted-foreground">
                            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="flex justify-center gap-3">
                                {otp.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-xl font-semibold"
                                    />
                                ))}
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-foreground hover:bg-foreground/90 text-background h-11"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Email'
                                )}
                            </Button>

                            <div className="text-center">
                                {resendTimer > 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        Resend code in <span className="font-medium text-foreground">{resendTimer}s</span>
                                    </p>
                                ) : (
                                    <Button type="button" variant="ghost" size="sm" onClick={handleResend}>
                                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                        Resend Code
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-foreground" /></div>}>
            <VerifyOTPContent />
        </Suspense>
    );
}
