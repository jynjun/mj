import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // L'app de jeu n'est pas une page de contenu a indexer.
      disallow: '/play',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
