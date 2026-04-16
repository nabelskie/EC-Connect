import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Standard Node.js module fallbacks for browser compatibility
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        perf_hooks: false,
        dns: false,
        os: false,
        path: false,
        crypto: false,
        http: false,
        https: false,
        http2: false,
        stream: false,
        zlib: false,
        url: false,
        punycode: false,
        async_hooks: false,
      };
    }
    return config;
  },
};

export default nextConfig;
