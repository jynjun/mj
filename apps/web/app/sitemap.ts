import type { MetadataRoute } from 'next';
import { roleIds, SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

/** Plan du site : vitrine indexable (les roles viennent du moteur). /play exclu. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['', '/roles', '/regles'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const rolePages = roleIds().map((id) => ({
    url: `${SITE_URL}/roles/${id}`,
    changeFrequency: 'yearly' as const,
    priority: 0.5,
  }));

  return [...staticPages, ...rolePages];
}
