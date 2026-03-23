'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  GraduationCap,
  Award,
  TrendingUp,
  Brain,
  FileText,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Zap,
  Clock,
} from 'lucide-react';

const features = [
  {
    icon: GraduationCap,
    title: 'NAAC Automation',
    description: 'Manage all 7 criteria with smart sub-criteria tracking, document uploads, and compliance scoring.',
    color: 'from-foreground/80 to-foreground',
  },
  {
    icon: Award,
    title: 'NBA Compliance',
    description: 'Program outcomes, CO-PO mapping matrix, SAR data preparation, and attainment tracking.',
    color: 'from-neutral-700 to-neutral-900',
  },
  {
    icon: TrendingUp,
    title: 'NIRF Rankings',
    description: 'Track all 5 NIRF parameters with metric-level data entry and real-time score calculations.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: Brain,
    title: 'AI Gap Analysis',
    description: 'GPT-4 powered analysis identifies gaps, generates recommendations, and predicts scores.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FileText,
    title: 'Document Vault',
    description: 'Centralized document management with categorization, versioning, and instant retrieval.',
    color: 'from-rose-500 to-red-600',
  },
  {
    icon: Shield,
    title: 'Compliance Reports',
    description: 'Auto-generated reports with actionable insights, readiness assessment, and timeline tracking.',
    color: 'from-cyan-500 to-blue-600',
  },
];

const stats = [
  { value: '95%', label: 'Time Saved', icon: Clock },
  { value: '500+', label: 'Colleges', icon: GraduationCap },
  { value: '10K+', label: 'Reports', icon: BarChart3 },
  { value: '99.9%', label: 'Uptime', icon: Zap },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '₹9,999',
    period: '/month',
    description: 'For small colleges starting their accreditation journey',
    features: ['1 Framework (NAAC/NBA/NIRF)', '5 Department limit', 'Basic AI Analysis', '10GB Document Storage', 'Email Support'],
    popular: false,
  },
  {
    name: 'Professional',
    price: '₹24,999',
    period: '/month',
    description: 'For colleges serious about accreditation excellence',
    features: ['All 3 Frameworks', 'Unlimited Departments', 'Advanced AI Analysis', '100GB Document Storage', 'Priority Support', 'Custom Reports', 'API Access'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For university groups and large institutions',
    features: ['Everything in Professional', 'Multi-campus Support', 'Dedicated Account Manager', 'Unlimited Storage', 'SLA Guarantee', 'Custom Integrations', 'On-premise Option'],
    popular: false,
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background scroll-smooth">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden p-0.5">
              <img src="/Accreditailogo.jpg" alt="AccreditAI Logo" className="h-full w-full object-contain" />
            </div>
            <span className="text-xl font-bold bg-foreground bg-clip-text text-transparent">
              AccreditAI
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Why Us</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="bg-foreground hover:bg-foreground/90 text-background shadow-lg shadow-foreground/10 text-sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-foreground/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-border/20 bg-accent px-4 py-1.5 mb-6"
            >
              <Sparkles className="h-3.5 w-3.5 text-foreground" />
              <span className="text-xs font-medium text-foreground">AI-Powered Accreditation Platform</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight"
            >
              Accreditation made{' '}
              <span className="bg-gradient-to-r from-foreground to-foreground bg-clip-text text-transparent">
                effortless
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Automate NAAC, NBA, and NIRF compliance for your institution with AI-driven gap analysis,
              smart document management, and real-time readiness tracking.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" className="bg-foreground hover:bg-foreground/90 text-background shadow-xl shadow-foreground/10 px-8 text-base h-12" asChild>
                <Link href="/signup">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 text-base h-12" asChild>
                <a href="#features">See How It Works</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={fadeInUp}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent mb-3">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold bg-foreground bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold"
            >
              Everything you need for{' '}
              <span className="bg-foreground bg-clip-text text-transparent">
                accreditation success
              </span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
            >
              A comprehensive platform that handles every aspect of NAAC, NBA, and NIRF preparation
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div key={feature.title} variants={fadeInUp} transition={{ duration: 0.5 }}>
                  <Card className="group relative overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm hover:border-border hover:shadow-xl hover:shadow-foreground/5 transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold">
              Simple, transparent pricing
            </motion.h2>
            <motion.p variants={fadeInUp} className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your institution&apos;s needs
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {pricingPlans.map((plan) => (
              <motion.div key={plan.name} variants={fadeInUp} transition={{ duration: 0.5 }}>
                <Card className={`relative overflow-hidden h-full ${plan.popular ? 'border-border shadow-xl shadow-foreground/5' : 'border-border/50'}`}>
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-foreground text-background hover:bg-foreground/90 text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${plan.popular ? 'bg-foreground hover:bg-foreground/90 text-background' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/signup">Get Started</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                <img src="/Accreditailogo.jpg" alt="AccreditAI" className="h-full w-full object-contain" />
              </div>
              <span className="text-lg font-bold bg-foreground bg-clip-text text-transparent">
                AccreditAI
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 AccreditAI. All rights reserved. Made for Indian Higher Education.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
