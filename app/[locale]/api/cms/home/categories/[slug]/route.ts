import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { fetchCategoryContentFromCMS } from '@/lib/contentful/category';

export interface CategoryCMSContentDTO {
  slug: string;
  excerpt: string;
  description: string;
  imageUrl?: string;
}

type Locale = 'de-DE' | 'en-GB';

async function _fetchCategory(
  slug: string,
  locale: Locale,
  preview: boolean
): Promise<CategoryCMSContentDTO | null> {
  return fetchCategoryContentFromCMS(slug, locale, preview);
}

const cachedFetchCategory = (
  slug: string,
  locale: Locale,
  preview: boolean
) =>
  cache(_fetchCategory, ['api-cms-category', slug, locale, String(preview)], {
    tags: [`cms:category:${locale}`],
    revalidate: 60 * 5,
  })(slug, locale, preview);

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: Locale; slug: string }> }
) {
  const { locale, slug } = await ctx.params;
  const previewHeader = req.headers.get('x-preview') === '1';
  const previewEnv = (process.env.CONTENTFUL_PREVIEW_ENABLED || 'false').trim() === 'true';
  const preview = previewHeader && previewEnv;

  const data = await cachedFetchCategory(slug, locale, preview);
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
