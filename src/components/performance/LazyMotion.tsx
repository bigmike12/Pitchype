import { LazyMotion, domAnimation, m } from 'framer-motion';
import { ReactNode } from 'react';

// Optimized motion wrapper that only loads animations when needed
export function OptimizedMotion({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}

// Pre-configured motion components with reduced bundle size
export const MotionDiv = m.div;
export const MotionSection = m.section;
export const MotionArticle = m.article;

// Common animation variants to reduce repetition
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2 }
};