import { NextResponse, type NextRequest } from 'next/server';

export const config = { matcher: ['/:path*'] };

const SUPPORTED = ['de-DE', 'en-GB'] as const;
type SupportedLocale = (typeof SUPPORTED)[number];
const DEFAULT_LOCALE: SupportedLocale = 'en-GB';

function normalizeLocaleTag(tag: string): string {
  // "de-at" -> "de-AT", "en" -> "en"
  const [lang, region] = tag.trim().split('-');
  if (!lang) return '';
  return region ? `${lang.toLowerCase()}-${region.toUpperCase()}` : lang.toLowerCase();
}

function parseAcceptLanguage(languageHeader: string): Array<{ tag: string; q: number; index: number }> {
  // Handle wildcard: accept any, prefer default and fallback
  if (languageHeader == '*') return [
    { tag: process.env.DEMO_DEFAULT_LOCALE ?? 'de-DE', q: 1.0, index: 0 },
    { tag: process.env.FALLBACK_LOCALE ?? 'en-GB', q: 0.9, index: 0 }
  ];

  // e.g. "de-AT,de;q=0.9,en-GB;q=0.8,en;q=0.7"
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

function mapBaseToSupported(base: string): SupportedLocale | null {
  if (base === 'de') return 'de-DE';
  if (base === 'en') return 'en-GB';
  return null;
}

// RFC 4647 "lookup" style: try exact, then strip region to base
function pickSupportedLocale(accepted: string[]): SupportedLocale {
  for (const raw of accepted) {
    const tag = normalizeLocaleTag(raw);
    if (!tag) continue;

    if (SUPPORTED.includes(tag as SupportedLocale)) {
      return tag as SupportedLocale;
    }

    const base = tag.split('-')[0];
    const mapped = mapBaseToSupported(base);
    if (mapped) return mapped;
  }
  return DEFAULT_LOCALE;
}

function currencyFor(locale: SupportedLocale): 'EUR' | 'GBP' {
  return locale === 'de-DE' ? 'EUR' : 'GBP';
}

export default function middleware(req: NextRequest) {
  const res = NextResponse.next();

  let anon = req.cookies.get('ct_anonymous_id')?.value;
  if (!anon) {
    anon = crypto.randomUUID();
    res.cookies.set('ct_anonymous_id', anon, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
  }

  const cookieLocale = (req.cookies.get('locale')?.value ?? process.env.DEMO_DEFAULT_LOCALE ?? 'en-GB') as 'de-DE' | 'en-GB';
  let locale: SupportedLocale;

  if (cookieLocale && SUPPORTED.includes(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const acceptHeader = req.headers.get('accept-language') || '';
    const parsed = parseAcceptLanguage(acceptHeader);
    const accepted = parsed.map((p) => p.tag);
    locale = pickSupportedLocale(accepted);

    res.cookies.set('locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
  }

  const currency = currencyFor(locale);
  const variant = req.nextUrl.pathname.length % 2 === 0 ? 'A' : 'B';

  res.headers.set('x-locale', locale);
  res.headers.set('x-currency', currency);
  res.headers.set('x-variant', variant);

  return res;
}
