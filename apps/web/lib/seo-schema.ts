import appConfig from '~/config/app.config';

/**
 * Generate Organization schema for JSON-LD
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: appConfig.name,
    url: appConfig.url,
    description: appConfig.description,
    logo: `${appConfig.url}/images/logo.png`,
    sameAs: [
      // Add your social media URLs here if applicable
      // 'https://twitter.com/yourhandle',
      // 'https://linkedin.com/company/yourcompany',
    ],
  };
}

/**
 * Generate Website schema for JSON-LD
 */
export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: appConfig.name,
    url: appConfig.url,
    description: appConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${appConfig.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate BreadcrumbList schema for JSON-LD
 */
export function generateBreadcrumbSchema(
  breadcrumbs: { name: string; url: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
}

/**
 * Convert schema object to JSON-LD script tag
 */
export function schemaToJsonLd(schema: unknown) {
  return JSON.stringify(schema);
}
