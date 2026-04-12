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
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Aggressive Webpack configuration to prevent Node.js modules 
  // from breaking the mobile app (static export) build.
  webpack: (config, { isServer }) => {
    if (!isServer) {
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
        stream: false,
        zlib: false,
      };
      
      // Exclude Genkit and its dependencies from the client-side bundle entirely
      config.module.rules.push({
        test: /node_modules\/(@genkit-ai|genkit|@grpc|@opentelemetry)/,
        use: 'null-loader',
      });
    }
    return config;
  },
};

export default nextConfig;
