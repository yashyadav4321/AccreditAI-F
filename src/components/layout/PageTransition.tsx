'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Wraps dashboard page content with a smooth fade + slide-up entrance animation.
 * Automatically keys on the current route so navigations trigger re-animation.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
