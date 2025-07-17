// Performance optimization utilities

// Debounce function for search inputs and API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for scroll events and frequent updates
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Simple in-memory cache with TTL
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data, expires });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new MemoryCache();

// Cleanup expired cache entries every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => cache.cleanup(), 10 * 60 * 1000);
}

// Request deduplication to prevent multiple identical API calls
class RequestDeduplicator {
  private pending = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If request is already pending, return the existing promise
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Remove from pending when completed
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  clear(): void {
    this.pending.clear();
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Optimized data fetcher with caching and deduplication
export async function optimizedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    cache?: boolean;
    cacheTTL?: number;
    dedupe?: boolean;
  } = {}
): Promise<T> {
  const { cache: useCache = true, cacheTTL, dedupe = true } = options;

  // Check cache first
  if (useCache) {
    const cached = cache.get(key);
    if (cached) {
      return cached;
    }
  }

  // Use deduplication if enabled
  const fetchData = dedupe
    ? () => requestDeduplicator.dedupe(key, fetchFn)
    : fetchFn;

  try {
    const data = await fetchData();
    
    // Cache the result
    if (useCache) {
      cache.set(key, data, cacheTTL);
    }
    
    return data;
  } catch (error) {
    // Don't cache errors
    throw error;
  }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
}

// Virtual scrolling helper for large lists
export function calculateVisibleItems(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 5
) {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return {
    startIndex,
    endIndex,
    visibleItems: endIndex - startIndex + 1
  };
}

// Bundle size analyzer (development only)
export function analyzeBundleSize() {
  if (process.env.NODE_ENV !== 'development') return;
  
  const modules = (window as any).webpackChunkName || [];
  console.group('Bundle Analysis');
  console.log('Loaded modules:', modules.length);
  
  if ('performance' in window) {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    console.log('Total JS size:', (totalSize / 1024).toFixed(2), 'KB');
    console.log('Largest JS files:', 
      jsResources
        .sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0))
        .slice(0, 5)
        .map(r => ({
          name: r.name.split('/').pop(),
          size: ((r.transferSize || 0) / 1024).toFixed(2) + 'KB'
        }))
    );
  }
  
  console.groupEnd();
}

// Performance budget checker
export function checkPerformanceBudget() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return;
  
  const budget = {
    maxJSSize: 500 * 1024, // 500KB
    maxCSSSize: 100 * 1024, // 100KB
    maxImageSize: 1000 * 1024, // 1MB
    maxTotalSize: 2000 * 1024 // 2MB
  };
  
  setTimeout(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const jsSize = resources
      .filter(r => r.name.includes('.js'))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);
      
    const cssSize = resources
      .filter(r => r.name.includes('.css'))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);
      
    const imageSize = resources
      .filter(r => /\.(jpg|jpeg|png|gif|webp|svg)/.test(r.name))
      .reduce((sum, r) => sum + (r.transferSize || 0), 0);
      
    const totalSize = jsSize + cssSize + imageSize;
    
    console.group('Performance Budget Check');
    
    if (jsSize > budget.maxJSSize) {
      console.warn(`JS size exceeded: ${(jsSize / 1024).toFixed(2)}KB > ${(budget.maxJSSize / 1024).toFixed(2)}KB`);
    }
    
    if (cssSize > budget.maxCSSSize) {
      console.warn(`CSS size exceeded: ${(cssSize / 1024).toFixed(2)}KB > ${(budget.maxCSSSize / 1024).toFixed(2)}KB`);
    }
    
    if (imageSize > budget.maxImageSize) {
      console.warn(`Image size exceeded: ${(imageSize / 1024).toFixed(2)}KB > ${(budget.maxImageSize / 1024).toFixed(2)}KB`);
    }
    
    if (totalSize > budget.maxTotalSize) {
      console.warn(`Total size exceeded: ${(totalSize / 1024).toFixed(2)}KB > ${(budget.maxTotalSize / 1024).toFixed(2)}KB`);
    }
    
    console.log('Current sizes:', {
      js: (jsSize / 1024).toFixed(2) + 'KB',
      css: (cssSize / 1024).toFixed(2) + 'KB',
      images: (imageSize / 1024).toFixed(2) + 'KB',
      total: (totalSize / 1024).toFixed(2) + 'KB'
    });
    
    console.groupEnd();
  }, 2000);
}