import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Headers for static assets
  async headers() {
    return [
      {
        // Video files - cache with revalidation
        source: '/:path*.webm',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Images - longer cache
        source: '/:path*.(png|jpg|jpeg|gif|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
