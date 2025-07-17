'use client';

import { useEffect } from 'react';

// Simplified performance monitoring without web-vitals dependency
const reportWebVitals = () => {
  if (typeof window === 'undefined') return;

  // Basic performance monitoring using Performance API
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`${entry.entryType}:`, entry);
      // Send to analytics service
    }
  });

  // Observe paint metrics
  try {
    observer.observe({ entryTypes: ['paint', 'navigation', 'measure'] });
  } catch (e) {
    console.warn('Performance Observer not supported:', e);
  }
};

// Performance monitoring for Core Web Vitals
export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    reportWebVitals();

    // Track page load performance
    const trackPageLoad = () => {
      if (typeof window !== 'undefined' && 'performance' in window) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navigation) {
              const metrics = {
                dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcp: navigation.connectEnd - navigation.connectStart,
                request: navigation.responseStart - navigation.requestStart,
                response: navigation.responseEnd - navigation.responseStart,
                dom: navigation.domContentLoadedEventEnd - navigation.responseEnd,
                load: navigation.loadEventEnd - navigation.loadEventStart,
                total: navigation.loadEventEnd - navigation.fetchStart
              };
              
              console.log('Page Load Metrics:', metrics);
              // Send to analytics service
            }
          }, 0);
        });
      }
    };

    trackPageLoad();
  }, []);

  return null;
}

// Hook for tracking component render performance
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      if (renderTime > 16) { // Flag renders longer than 16ms (60fps)
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
}

// Memory usage tracker
export function useMemoryMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('memory' in performance)) return;

    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory) {
        const used = memory.usedJSHeapSize / 1048576; // Convert to MB
        const total = memory.totalJSHeapSize / 1048576;
        const limit = memory.jsHeapSizeLimit / 1048576;
        
        if (used / limit > 0.8) { // Warn if using more than 80% of heap
          console.warn(`High memory usage: ${used.toFixed(2)}MB / ${limit.toFixed(2)}MB`);
        }
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);
}