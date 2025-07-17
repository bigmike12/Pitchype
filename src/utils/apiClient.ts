import { apiCache } from './performance';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  cacheTTL?: number;
  retries?: number;
  timeout?: number;
}

class OptimizedAPIClient {
  private baseURL: string;
  private pendingRequests = new Map<string, Promise<any>>();
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getCacheKey(url: string, config: RequestConfig): string {
    return `${config.method || 'GET'}:${url}:${JSON.stringify(config.body || {})}`;
  }

  private async makeRequest(url: string, config: RequestConfig): Promise<any> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const method = config.method || 'GET';
    const timeout = config.timeout || 10000;
    const retries = config.retries || 0;

    const requestConfig: RequestInit = {
      method,
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
    };

    if (config.body && method !== 'GET') {
      requestConfig.body = JSON.stringify(config.body);
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    requestConfig.signal = controller.signal;

    try {
      const response = await fetch(fullUrl, requestConfig);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (retries > 0 && error instanceof Error && !error.name.includes('Abort')) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, 3 - retries) * 1000));
        return this.makeRequest(url, { ...config, retries: retries - 1 });
      }
      
      throw error;
    }
  }

  async request(url: string, config: RequestConfig = {}): Promise<any> {
    const cacheKey = this.getCacheKey(url, config);
    const method = config.method || 'GET';

    // Check cache for GET requests
    if (method === 'GET' && config.cache !== false) {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Request deduplication for GET requests
    if (method === 'GET' && this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const requestPromise = this.makeRequest(url, config);
    
    if (method === 'GET') {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    try {
      const data = await requestPromise;
      
      // Cache successful GET requests
      if (method === 'GET' && config.cache !== false) {
        apiCache.set(cacheKey, data, config.cacheTTL);
      }
      
      return data;
    } finally {
      if (method === 'GET') {
        this.pendingRequests.delete(cacheKey);
      }
    }
  }

  // Convenience methods
  get(url: string, config: Omit<RequestConfig, 'method'> = {}) {
    return this.request(url, { ...config, method: 'GET' });
  }

  post(url: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}) {
    return this.request(url, { ...config, method: 'POST', body });
  }

  put(url: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}) {
    return this.request(url, { ...config, method: 'PUT', body });
  }

  patch(url: string, body?: any, config: Omit<RequestConfig, 'method' | 'body'> = {}) {
    return this.request(url, { ...config, method: 'PATCH', body });
  }

  delete(url: string, config: Omit<RequestConfig, 'method'> = {}) {
    return this.request(url, { ...config, method: 'DELETE' });
  }

  // Cache management
  clearCache() {
    apiCache.clear();
  }

  invalidateCache(pattern?: string) {
    if (pattern) {
      // Implementation for pattern-based cache invalidation
      // This would require extending the APICache class
    } else {
      apiCache.clear();
    }
  }
}

// Export singleton instance
export const apiClient = new OptimizedAPIClient();

// Export class for custom instances
export { OptimizedAPIClient };