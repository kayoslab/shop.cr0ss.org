import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { fetchHomeFromCMS } from '@/lib/contentful/home';
import type { HomeDTO } from '@/lib/contentful/dto/home';
import { SupportedLocale } from '@/lib/i18n/locales';

async function _fetchHome(locale: SupportedLocale, preview: boolean): Promise<HomeDTO | null> {
  return fetchHomeFromCMS(locale, preview);
}

const cachedFetchHome = (
  locale: SupportedLocale,
  preview: boolean
) =>
  cache(_fetchHome, ['api-cms-home', locale, String(preview)], {
    tags: [`cms:home:${locale}`],
    revalidate: 60 * 5,
  })(locale, preview);

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string }> }
) {
  const { locale } = await ctx.params;

  // Preview is explicit: only if header is '1' AND env allows preview
  const previewHeader = req.headers.get('x-preview') === '1';
  const previewEnv = (process.env.CONTENTFUL_PREVIEW_ENABLED || 'false').trim() === 'true';
  const preview = previewHeader && previewEnv;

  const typedLocale = (locale === 'de-DE' ? 'de-DE' : 'en-GB') as SupportedLocale;

  if (typedLocale !== locale) {
    return new NextResponse('Locale not supported', { status: 400 });
  }
  
  const data = await cachedFetchHome(typedLocale, preview);
  if (!data) return new NextResponse('Not found', { status: 404 });

  // Prefer relying on unstable_cache; avoid CDN caching for this API
  // return NextResponse.json(data, {
  //   headers: { 'Cache-Control': 'no-store' },
  // });

  // Short s-maxage and vary on preview:
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
      'Vary': 'accept-encoding, x-preview',
    },
  });
}
