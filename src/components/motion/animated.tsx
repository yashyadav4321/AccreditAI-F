'use client';

import React from 'react';
import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';

/* ══════════════════════════════════════════════════════════════
   Reusable Framer-Motion primitives for the whole app.
   Import these instead of raw <motion.div> everywhere.
   ══════════════════════════════════════════════════════════════ */

// ── Variants ──────────────────────────────────────────────────

/** Fade + slide up — the default entry for most elements */
export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

/** Fade + slide from left */
export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
};

/** Fade + slide from right */
export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
};

/** Scale up from 95% — good for cards */
export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
};

/** Simple fade */
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

/** Stagger parent — delays each child by `staggerChildren` seconds */
export const staggerContainer = (staggerChildren = 0.06, delayChildren = 0): Variants => ({
    hidden: {},
    visible: {
        transition: { staggerChildren, delayChildren },
    },
});

// ── Components ────────────────────────────────────────────────

interface StaggerGroupProps extends HTMLMotionProps<'div'> {
    /** Delay between each child animation in seconds (default 0.06) */
    stagger?: number;
    /** Initial delay before the first child starts (default 0) */
    delay?: number;
    children: React.ReactNode;
}

/**
 * Stagger-animated container. Wrap a list of `<AnimatedItem>` children
 * and they'll appear one after another with a configurable delay.
 *
 * ```tsx
 * <StaggerGroup stagger={0.08}>
 *   <AnimatedItem><Card>…</Card></AnimatedItem>
 *   <AnimatedItem><Card>…</Card></AnimatedItem>
 * </StaggerGroup>
 * ```
 */
export function StaggerGroup({ stagger = 0.06, delay = 0, children, ...rest }: StaggerGroupProps) {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer(stagger, delay)}
            {...rest}
        >
            {children}
        </motion.div>
    );
}

interface AnimatedItemProps extends HTMLMotionProps<'div'> {
    /** Which variant set to use (default: fadeInUp) */
    variant?: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'fadeIn';
    /** Duration in seconds (default 0.4) */
    duration?: number;
    children: React.ReactNode;
}

const variantMap: Record<string, Variants> = {
    fadeInUp,
    fadeInLeft,
    fadeInRight,
    scaleIn,
    fadeIn,
};

/**
 * A single animated item. Works standalone or inside a `<StaggerGroup>`.
 *
 * ```tsx
 * <AnimatedItem variant="scaleIn">
 *   <Card>…</Card>
 * </AnimatedItem>
 * ```
 */
export function AnimatedItem({ variant = 'fadeInUp', duration = 0.4, children, ...rest }: AnimatedItemProps) {
    return (
        <motion.div
            variants={variantMap[variant]}
            transition={{ duration, ease: [0.25, 0.46, 0.45, 0.94] }}
            {...rest}
        >
            {children}
        </motion.div>
    );
}

interface AnimatedCounterProps {
    /** Target number to count up to */
    value: number;
    /** Duration of the count animation in seconds */
    duration?: number;
    /** Optional formatter (e.g. to add % suffix) */
    format?: (n: number) => string;
    className?: string;
}

/**
 * Animated counter that counts up from 0 to `value` on mount.
 */
export function AnimatedCounter({ value, duration = 1.2, format, className }: AnimatedCounterProps) {
    const [display, setDisplay] = React.useState(0);

    React.useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        const totalFrames = Math.round(duration * 60); // ~60fps
        const increment = end / totalFrames;
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            start += increment;
            if (frame >= totalFrames) {
                clearInterval(timer);
                setDisplay(end);
            } else {
                setDisplay(Math.round(start));
            }
        }, 1000 / 60);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span className={className}>{format ? format(display) : display}</span>;
}
