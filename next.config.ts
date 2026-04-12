
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Required for static exports used in mobile apps (Capacitor)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Required for static exports used in mobile apps
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Stub out Node.js modules that don't exist in the browser/mobile environment
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
        http2: false, // CRITICAL: Fixed the "Can't resolve http2" error
        stream: false,
        zlib: false,
        url: false,
        punycode: false,
        async_hooks: false,
      };
      
      // Aggressively exclude Genkit and its heavy server-only dependencies from the mobile bundle
      // We use null-loader to effectively delete these modules from the client-side build
      config.module.rules.push({
        test: /node_modules\/(@genkit-ai|genkit|@grpc|@opentelemetry|google-auth-library|gaxios|gcp-metadata|google-p12-asn1|retry-request)/,
        use: 'null-loader',
      });
    }
    return config;
  },
};

export default nextConfig;
