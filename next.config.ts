import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; connect-src 'self' https://raw.githubusercontent.com; img-src 'self' data: https://raw.githubusercontent.com https://images.unsplash.com; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
