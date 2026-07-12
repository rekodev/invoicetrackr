export type SupportedLocale = 'en' | 'lt';

export function resolveLocale(
  cookieLocale?: string,
  acceptLanguage?: string | null
): SupportedLocale {
  if (cookieLocale === 'en' || cookieLocale === 'lt') {
    return cookieLocale;
  }

  if (!acceptLanguage) {
    return 'en';
  }

  const preferredLocale = acceptLanguage
    .split(',')
    .map((entry, index) => {
      const [languageTag, qualityPart] = entry.trim().split(';');

      const locale = languageTag
        ?.substring(0, 2)
        .toLowerCase() as SupportedLocale;

      const qualityParameter = qualityPart?.trim();
      const quality = qualityParameter?.startsWith('q=')
        ? Number.parseFloat(qualityParameter.substring(2))
        : 1;

      return {
        locale,
        quality: Number.isNaN(quality) ? 0 : quality,
        index
      };
    })
    .filter(
      ({ locale, quality }) =>
        (locale === 'en' || locale === 'lt') && quality > 0
    )
    .sort((a, b) => b.quality - a.quality || a.index - b.index)[0]?.locale;

  return preferredLocale ?? 'en';
}
