import type { MetadataRoute } from 'next';

import { getAbsoluteUrl, seoPages } from '@/lib/seo/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(seoPages).map((page) => ({
    url: getAbsoluteUrl(page.pathname),
    lastModified: new Date(),
    changeFrequency: page.pathname === '/' ? 'weekly' : 'monthly',
    priority: page.priority
  }));
}
