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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const signupSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            'Must contain at least one uppercase letter, one lowercase letter, and one number'
        ),
    confirmPassword: z.string(),
    role: z.enum(['COLLEGE_ADMIN', 'FACULTY'] as const, {
        error: 'Select a role',
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
    const { signup } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsSubmitting(true);
        try {
            await signup({
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role,
            });
            toast.success('Account created! You can now log in.');
        } catch (error: unknown) {
            const err = error as {
                response?: {
                    data?: {
                        message?: string;
                        errors?: { field: string; message: string }[];
                    };
                };
            };
            const backendErrors = err.response?.data?.errors;
            if (backendErrors && backendErrors.length > 0) {
                // Show each specific validation error as a toast
                backendErrors.forEach((e) => {
                    const fieldLabel = e.field.replace('body.', '').replace(/([A-Z])/g, ' $1');
                    toast.error(`${fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)}: ${e.message}`);
                });
            } else {
                toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-3xl font-bold text-white">AccreditAI</span>
                    </div>
                    <h2 className="text-4xl font-bold text-white leading-tight">
                        Join the future of accreditation.
                    </h2>
                    <p className="mt-4 text-lg text-neutral-400 leading-relaxed max-w-md">
                        Create your account and start automating compliance workflows within minutes.
                    </p>
                </div>
            </div>

            {/* Right side — Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-background">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-foreground bg-clip-text text-transparent">
                            AccreditAI
                        </span>
                    </div>

                    <Card className="border-border/50 shadow-xl">
                        <CardHeader className="space-y-1 pb-4">
                            <h1 className="text-2xl font-bold">Create your account</h1>
                            <p className="text-sm text-muted-foreground">Get started with AccreditAI in minutes</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            placeholder="John"
                                            {...register('firstName')}
                                            className={errors.firstName ? 'border-red-500' : ''}
                                        />
                                        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            placeholder="Doe"
                                            {...register('lastName')}
                                            className={errors.lastName ? 'border-red-500' : ''}
                                        />
                                        {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@college.edu"
                                        {...register('email')}
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role</Label>
                                    <Select onValueChange={(val) => setValue('role', val as 'COLLEGE_ADMIN' | 'FACULTY')}>
                                        <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select your role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="COLLEGE_ADMIN">College Administrator</SelectItem>
                                            <SelectItem value="FACULTY">Faculty Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min. 8 characters"
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
                                    {errors.password ? (
                                        <p className="text-xs text-red-500">{errors.password.message}</p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">Min. 8 chars, include uppercase, lowercase &amp; number</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Re-enter password"
                                        {...register('confirmPassword')}
                                        className={errors.confirmPassword ? 'border-red-500' : ''}
                                    />
                                    {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-foreground hover:bg-foreground/90 text-background h-11"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating account...
                                        </>
                                    ) : (
                                        'Create Account'
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="text-foreground hover:text-foreground font-medium transition-colors">
                                    Sign in
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
