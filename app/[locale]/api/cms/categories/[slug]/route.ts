import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { fetchCategoryContentFromCMS } from '@/lib/contentful/category';
import { SupportedLocale, isSupportedLocale } from '@/lib/i18n/locales';
import { cmsTags } from '@/lib/cache/tags';
import { ErrorResponses } from '@/lib/utils/apiErrors';
import { CACHE_REVALIDATION as cache_revalidation } from '@/lib/config/cache';

export interface CategoryCMSContentDTO {
  title: string;
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
    tags: [cmsTags.category(slug, locale)],
    revalidate: cache_revalidation.HOME,
  })(slug, locale, preview);

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await ctx.params;
  const previewHeader = req.headers.get('x-preview') === '1';
  const previewEnv = (process.env.CONTENTFUL_PREVIEW_ENABLED || 'false').trim() === 'true';
  const preview = previewHeader && previewEnv;

  if (!isSupportedLocale(locale)) {
    return ErrorResponses.localeNotSupported();
  }

  const data = await cachedFetchCategory(slug, locale, preview);

  if (!data) return ErrorResponses.notFound('Category content');

  // Let unstable_cache handle caching; keep the HTTP response non-cacheable at CDN
  // return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });

  // Short s-maxage and vary on preview:
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
      'Vary': 'accept-encoding, x-preview',
    },
  });
}
