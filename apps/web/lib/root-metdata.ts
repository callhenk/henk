import { Metadata } from 'next';

import { headers } from 'next/headers';

import appConfig from '~/config/app.config';
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  schemaToJsonLd,
} from '~/lib/seo-schema';

/**
 * @name generateRootMetadata
 * @description Generates the root metadata for the application
 */
export const generateRootMetadata = async (): Promise<Metadata> => {
  const headersStore = await headers();
  const csrfToken = headersStore.get('x-csrf-token') ?? '';

  return {
    title: appConfig.title,
    description: appConfig.description,
    metadataBase: new URL(appConfig.url),
    applicationName: appConfig.name,
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
      userScalable: true,
    },
    other: {
      'csrf-token': csrfToken,
      'schema:organization': schemaToJsonLd(generateOrganizationSchema()),
      'schema:website': schemaToJsonLd(generateWebsiteSchema()),
    },
    openGraph: {
      url: appConfig.url,
      siteName: appConfig.name,
      title: appConfig.title,
      description: appConfig.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: appConfig.title,
      description: appConfig.description,
    },
    icons: {
      icon: '/images/favicon/favicon.ico',
      apple: '/images/favicon/apple-touch-icon.png',
    },
  };
};
