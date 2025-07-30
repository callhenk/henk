/**
 * Resolves the translation file for a given language and namespace.
 * Uses a robust approach that works with Next.js build process.
 */
export async function i18nResolver(language: string, namespace: string) {
  // Try different path resolutions for better compatibility
  const paths = [
    `../../public/locales/${language}/${namespace}.json`,
    `../../../public/locales/${language}/${namespace}.json`,
    `./public/locales/${language}/${namespace}.json`,
    `/public/locales/${language}/${namespace}.json`,
  ];

  for (const path of paths) {
    try {
      const data = await import(path);
      return data.default || (data as Record<string, string>);
    } catch {
      // Continue to next path if this one fails
      continue;
    }
  }

  // If all paths fail, return empty object
  console.warn(
    `Failed to load i18n file: locales/${language}/${namespace}.json`,
  );
  return {};
}
