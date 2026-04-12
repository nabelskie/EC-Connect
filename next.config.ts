
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
      // 1. Force Resolve Aliases to 'false' (Completely ignore these modules in the browser bundle)
      config.resolve.alias = {
        ...config.resolve.alias,
        'genkit': false,
        '@genkit-ai/google-genai': false,
        '@genkit-ai/ai': false,
        '@genkit-ai/core': false,
        'wav': false,
        'grpc': false,
        '@grpc/grpc-js': false,
        'http2': false,
      };

      // 2. Fallbacks for standard Node.js modules
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
      
      // 3. Use null-loader for any remaining heavy modules
      config.module.rules.push({
        test: /node_modules\/(@genkit-ai|genkit|@grpc|@opentelemetry|google-auth-library|gaxios|gcp-metadata|google-p12-asn1|retry-request)/,
        use: 'null-loader',
      });
    }
    return config;
  },
};

export default nextConfig;
