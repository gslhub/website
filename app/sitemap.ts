import type { MetadataRoute } from 'next';

const routes = [
  '',
  '/research',
  '/research-infrastructure',
  '/es/research-infrastructure',
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
    changeFrequency:
      route === '' || route === '/dashboard' || route.includes('research-infrastructure')
        ? 'weekly'
        : 'monthly',
    priority: route === '' ? 1 : route.includes('research-infrastructure') ? 0.9 : 0.8,
  }));
}
