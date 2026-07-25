import type { MetadataRoute } from 'next';

const routes = [
  '',
  '/research',
  '/benchmarks',
  '/dashboard',
  '/publications',
  '/software',
  '/datasets',
  '/resources',
  '/people',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://gslhub.com${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/dashboard' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.8,
  }));
}
