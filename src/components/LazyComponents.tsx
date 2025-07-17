import { lazy, Suspense, ComponentType } from 'react';

// Enhanced lazy loading with preloading capabilities
function createLazyComponent<T = any>(importFn: () => Promise<{ default: ComponentType<T> }>) {
  const LazyComponent = lazy(importFn);
  
  // Add preload method
  (LazyComponent as any).preload = importFn;
  
  return LazyComponent;
}

// Lazy load heavy components to improve initial page load
export const AnalyticsSubmissionForm = createLazyComponent(() => import('./campaign-analytics/AnalyticsSubmissionForm'));
export const AnalyticsVerificationCard = createLazyComponent(() => import('./campaign-analytics/AnalyticsVerificationCard'));
export const BankDetailsForm = createLazyComponent(() => import('./bank-details/BankDetailsForm'));
export const SocialMediaVerificationForm = createLazyComponent(() => import('./social-media/SocialMediaVerificationForm'));
export const InfluencerReviewForm = createLazyComponent(() => import('./business/InfluencerReviewForm'));
export const SubmitWork = createLazyComponent(() => import('./influencer/SubmitWork'));
export const PayoutRequest = createLazyComponent(() => import('./influencer/PayoutRequest'));

// Lazy load chart components with simplified imports
export const LazyBarChart = lazy(() => import('recharts').then(mod => ({ default: mod.BarChart })));
export const LazyLineChart = lazy(() => import('recharts').then(mod => ({ default: mod.LineChart })));
export const LazyPieChart = lazy(() => import('recharts').then(mod => ({ default: mod.PieChart })));
export const LazyResponsiveContainer = lazy(() => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })));
export const LazyXAxis = lazy(() => import('recharts').then(mod => ({ default: mod.XAxis })));
export const LazyYAxis = lazy(() => import('recharts').then(mod => ({ default: mod.YAxis })));
export const LazyCartesianGrid = lazy(() => import('recharts').then(mod => ({ default: mod.CartesianGrid })));
export const LazyTooltip = lazy(() => import('recharts').then(mod => ({ default: mod.Tooltip })));
export const LazyLegend = lazy(() => import('recharts').then(mod => ({ default: mod.Legend })));

// Loading fallback components with different sizes
export const ComponentLoader = ({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) => {
  const sizeClasses = {
    small: 'p-4 h-6 w-6',
    default: 'p-8 h-8 w-8',
    large: 'p-12 h-12 w-12'
  };
  
  return (
    <div className="flex items-center justify-center">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
      <span className="ml-2 text-gray-600">Loading...</span>
    </div>
  );
};

// Skeleton loader for charts
export const ChartSkeleton = () => (
  <div className="w-full h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading chart...</div>
  </div>
);

// HOC for lazy loading with suspense
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <ComponentLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// Preload components on hover or focus
export function usePreloadOnHover(lazyComponent: any) {
  const preload = () => {
    if (lazyComponent.preload) {
      lazyComponent.preload();
    }
  };
  
  return {
    onMouseEnter: preload,
    onFocus: preload
  };
}