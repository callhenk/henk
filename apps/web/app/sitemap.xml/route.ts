import { getServerSideSitemap } from 'next-sitemap';

import appConfig from '~/config/app.config';

/**
 * @description The maximum age of the sitemap in seconds.
 * This is used to set the cache-control header for the sitemap. The cache-control header is used to control how long the sitemap is cached.
 * By default, the cache-control header is set to 'public, max-age=60, s-maxage=3600'.
 * This means that the sitemap will be cached for 60 seconds (1 minute) and will be considered stale after 3600 seconds (1 hour).
 */
const MAX_AGE = 60;
const S_MAX_AGE = 3600;

export async function GET() {
  const paths = getPaths();

  const headers = {
    'Cache-Control': `public, max-age=${MAX_AGE}, s-maxage=${S_MAX_AGE}`,
  };

  return getServerSideSitemap([...paths], headers);
}

function getPaths() {
  // Public-facing pages that should be indexed
  const publicPages = [
    {
      path: '/',
      changeFreq: 'monthly' as const,
      priority: 1.0,
    },
    // TODO: Uncomment these when the pages are created
    // {
    //   path: '/privacy-policy',
    //   changeFreq: 'yearly' as const,
    //   priority: 0.5,
    // },
    // {
    //   path: '/terms-of-service',
    //   changeFreq: 'yearly' as const,
    //   priority: 0.5,
    // },
    // {
    //   path: '/cookie-policy',
    //   changeFreq: 'yearly' as const,
    //   priority: 0.5,
    // },
    // Add additional public marketing pages here as needed
    // Example:
    // {
    //   path: '/features',
    //   changeFreq: 'monthly' as const,
    //   priority: 0.8,
    // },
    // {
    //   path: '/pricing',
    //   changeFreq: 'monthly' as const,
    //   priority: 0.8,
    // },
  ];

  return publicPages.map(({ path, changeFreq, priority }) => {
    return {
      loc: new URL(path, appConfig.url).href,
      lastmod: new Date().toISOString(),
      changefreq: changeFreq,
      priority: priority,
    };
  });
}
