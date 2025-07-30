/**
 * Resolves the translation file for a given language and namespace.
 * Uses static imports for better compatibility with Next.js development and production.
 */
export async function i18nResolver(language: string, namespace: string) {
  try {
    // Use a switch statement to handle different combinations statically
    const key = `${language}/${namespace}`;

    switch (key) {
      case 'en/common':
        return (await import('../../public/locales/en/common.json')).default;
      case 'en/auth':
        return (await import('../../public/locales/en/auth.json')).default;
      case 'en/account':
        return (await import('../../public/locales/en/account.json')).default;
      case 'en/teams':
        return (await import('../../public/locales/en/teams.json')).default;
      case 'en/billing':
        return (await import('../../public/locales/en/billing.json')).default;
      case 'en/marketing':
        return (await import('../../public/locales/en/marketing.json')).default;
      default:
        console.warn(`No translation found for: ${key}`);
        return {};
    }
  } catch (error) {
    console.warn(
      `Failed to load i18n file: ${language}/${namespace}.json`,
      error,
    );
    return {};
  }
}
