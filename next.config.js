/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Only apply these modifications for client-side bundles
    if (!isServer) {
      // Prevent client-side bundling of node-specific modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        sqlite3: false,
        'better-sqlite3': false,
        sqlite: false
      };
    }
    
    // Ensure proper path alias resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, './src')
    };
    
    return config;
  },
  experimental: {
    // Add any experimental features here
    esmExternals: true,
  }
};

module.exports = nextConfig; 