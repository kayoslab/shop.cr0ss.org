export type SupportedLocale = 'de-DE' | 'en-GB';
export type SupportedCurrency = 'EUR' | 'GBP';
export type SupportedCountry = 'DE' | 'GB';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['de-DE', 'en-GB'];
export const SUPPORTED_CURRENCIES: SupportedCurrency[] = ['EUR', 'GBP'];
export const SUPPORTED_COUNTRIES: SupportedCountry[] = ['DE', 'GB'];

export const DEFAULT_LOCALE: SupportedLocale = 'de-DE';
export const DEFAULT_CURRENCY: SupportedCurrency = 'EUR';
export const DEFAULT_COUNTRY: SupportedCountry = 'DE';

const LANGUAGE_HEADER_MAP: Array<{ tag: string; q: number; index: number }> = [
  { tag: 'de-DE', q: 1.0, index: 0 },
  { tag: 'en-GB', q: 0.9, index: 0 }
];

const LABEL: Record<SupportedLocale, string> = {
  'de-DE': 'Deutsch (DE)',
  'en-GB': 'English (UK)',
};
const FLAG: Record<SupportedLocale, string> = {
  'de-DE': '🇩🇪',
  'en-GB': '🇬🇧',
};
export function localeToLabel(locale: SupportedLocale): string {
  return LABEL[locale] ?? locale;
}

export function localeToFlag(locale: SupportedLocale): string {
  return FLAG[locale] ?? '🏳️';
}

export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export function localeToCurrency(locale: SupportedLocale): 'EUR' | 'GBP' {
  return locale === 'de-DE' ? 'EUR' : 'GBP';
}

export function localeToCountry(locale: SupportedLocale): 'DE' | 'GB' {
  return locale === 'de-DE' ? 'DE' : 'GB';
}

export function countryToLocale(country: string): SupportedLocale {
  if (country === 'DE') return 'de-DE';
  return 'en-GB';
}

export function currencyToLocale(currency: string): SupportedLocale {
  if (currency === 'EUR') return 'de-DE';
  return 'en-GB';
}

export function otherLocale(locale: SupportedLocale): SupportedLocale {
  return locale === 'de-DE' ? 'en-GB' : 'de-DE';
}

function normalizeLocaleTag(tag: string): string {
  const [lang, region] = tag.trim().split('-');
  if (!lang) return '';
  return region ? `${lang.toLowerCase()}-${region.toUpperCase()}` : lang.toLowerCase();
}

function parseAcceptLanguage(languageHeader: string): Array<{ tag: string; q: number; index: number }> {
  if (languageHeader == '*') return LANGUAGE_HEADER_MAP;
  if (languageHeader == '') return LANGUAGE_HEADER_MAP;

  return languageHeader
    .split(',')
    .map((part, index) => {
      const [rawTag, ...params] = part.trim().split(';');
      const tag = normalizeLocaleTag(rawTag);
      let q = 1.0;
      for (const p of params) {
        const [k, v] = p.split('=').map((s) => s.trim());
        if (k === 'q') {
          const num = Number(v);
          if (!Number.isNaN(num)) q = num;
        }
      }
      return { tag, q, index };
    })
    .filter((x) => x.tag !== '')
    .sort((a, b) => (b.q === a.q ? a.index - b.index : b.q - a.q));
}