import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

const noStoreHeaders = [
  {
    key: 'Cache-Control',
    value: 'private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
  },
  {
    key: 'CDN-Cache-Control',
    value: 'no-store',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: noStoreHeaders,
      },
      {
        source: '/api/:path*',
        headers: noStoreHeaders,
      },
    ];
  },
};

export default withPayload(nextConfig);
