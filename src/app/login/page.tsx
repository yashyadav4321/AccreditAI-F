'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsSubmitting(true);
        try {
            await login(data.email, data.password);
            toast.success('Welcome back!');
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; request?: unknown; message?: string };
            if (err.response) {
                // Backend responded with an error status
                toast.error(err.response.data?.message || 'Invalid credentials');
            } else if (err.request) {
                // Request was made but no response received — backend is offline
                toast.error('Cannot connect to server. Please make sure the backend is running.');
            } else {
                // Something else (e.g. response parsing error)
                toast.error(err.message || 'Login failed. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side — Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-950">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
                <div className="relative z-10 flex flex-col justify-center px-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm p-1">
                            <img src="/Accreditailogo.jpg" alt="AccreditAI Logo" className="h-full w-full object-contain" />
                        </div>
                        <span className="text-3xl font-bold text-white">AccreditAI</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Your accreditation journey starts here.
                    </h2>
                    <p className="mt-4 text-lg text-neutral-400 leading-relaxed max-w-md">
                        Join hundreds of institutions automating their NAAC, NBA, and NIRF compliance with AI-powered insights.
                    </p>
                    <div className="mt-12 space-y-4">
                        {['AI-powered gap analysis', 'Real-time compliance tracking', 'Automated report generation'].map((item) => (
                            <div key={item} className="flex items-center gap-3 text-neutral-300">
                                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                <span className="text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side — Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden p-0.5">
                            <img src="/Accreditailogo.jpg" alt="AccreditAI Logo" className="h-full w-full object-contain" />
                        </div>
                        <span className="text-xl font-bold bg-foreground bg-clip-text text-transparent">
                            AccreditAI
                        </span>
                    </div>

                    <Card className="border-border/50 shadow-xl">
                        <CardHeader className="space-y-1 pb-4">
                            <h1 className="text-2xl font-bold">Welcome back</h1>
                            <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@college.edu"
                                        {...register('email')}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-xs text-red-500">{errors.email.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Password</Label>
                                        <Link href="/forgot-password" className="text-xs text-foreground hover:text-foreground transition-colors">
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            {...register('password')}
                                            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-xs text-red-500">{errors.password.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-foreground hover:bg-foreground/90 text-background h-11"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-muted-foreground">
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className="text-foreground hover:text-foreground font-medium transition-colors">
                                    Create one
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
