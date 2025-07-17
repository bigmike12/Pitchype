import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', 'recharts'],
  },
  
  // Turbopack configuration temporarily disabled due to build issues
  // turbopack: {
  //   resolveAlias: {
  //     '@': path.resolve(__dirname, 'src'),
  //     '@/components': path.resolve(__dirname, 'src/components'),
  //     '@/lib': path.resolve(__dirname, 'src/lib'),
  //     '@/hooks': path.resolve(__dirname, 'src/hooks'),
  //     '@/contexts': path.resolve(__dirname, 'src/contexts'),
  //     '@/types': path.resolve(__dirname, 'src/types'),
  //     '@/utils': path.resolve(__dirname, 'src/utils')
  //   },
  //   resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
  // },
  
  // Optimize images
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  
  // Enable compression
  compress: true,
  
  // Optimize bundle
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Enable bundle analyzer in development
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        );
      }
      return config;
    },
  }),
};

export default nextConfig;
