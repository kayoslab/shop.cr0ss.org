import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { fetchCategoryContentFromCMS } from '@/lib/contentful/category';
import { SupportedLocale } from '@/lib/i18n/locales';

export interface CategoryCMSContentDTO {
  slug: string;
  excerpt: string;
  description: string;
  imageUrl?: string;
}

async function _fetchCategory(
  slug: string,
  locale: SupportedLocale,
  preview: boolean
): Promise<CategoryCMSContentDTO | null> {
  return fetchCategoryContentFromCMS(slug, locale, preview);
}

const cachedFetchCategory = (
  slug: string,
  locale: SupportedLocale,
  preview: boolean
) =>
  cache(_fetchCategory, ['api-cms-category', slug, locale, String(preview)], {
    tags: [`cms:category:${locale}`],
    revalidate: 60 * 5,
  })(slug, locale, preview);

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await ctx.params;
  const previewHeader = req.headers.get('x-preview') === '1';
  const previewEnv = (process.env.CONTENTFUL_PREVIEW_ENABLED || 'false').trim() === 'true';
  const preview = previewHeader && previewEnv;

  const typedLocale = (locale === 'de-DE' ? 'de-DE' : 'en-GB') as SupportedLocale;

  if (typedLocale !== locale) {
    return new NextResponse('Locale not supported', { status: 400 });
  }
  
  const data = await cachedFetchCategory(slug, typedLocale, preview);

  if (!data) return new NextResponse('Not found', { status: 404 });

  // Let unstable_cache handle caching; keep the HTTP response non-cacheable at CDN
  // return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });

  // If you insist on CDN caching, switch to short s-maxage and vary on preview:
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
      'Vary': 'accept-encoding,x-preview',
    },
  });
}
