import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

const dynamicRouteHeaders = [
  {
    key: 'Cache-Control',
    value:
      'private, no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0, no-transform',
  },
  {
    key: 'CDN-Cache-Control',
    value: 'no-store',
  },
  {
    key: 'Surrogate-Control',
    value: 'no-store',
  },
  {
    key: 'X-Accel-Buffering',
    value: 'no',
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/admin/login',
        destination: '/cms-login',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: dynamicRouteHeaders,
      },
      {
        source: '/cms-login',
        headers: dynamicRouteHeaders,
      },
      {
        source: '/api/:path*',
        headers: dynamicRouteHeaders,
      },
    ];
  },
};

export default withPayload(nextConfig);
