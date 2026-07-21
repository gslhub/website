import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://gslhub.com/sitemap.xml',
    host: 'https://gslhub.com',
  };
}
