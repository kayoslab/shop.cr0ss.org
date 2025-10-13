import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { fetchCategoryContentFromCMS } from '@/lib/contentful/category';
import { cookies } from 'next/dist/server/request/cookies';

export interface CategoryCMSContentDTO {
    slug: string;
    excerpt: string;
    description: string;
    imageUrl?: string;
}

async function _fetchCategory(slug: string, locale: string, preview: boolean): Promise<CategoryCMSContentDTO | null> {
  return fetchCategoryContentFromCMS(slug, locale, preview);
}

const cachedFetchCategory = cache(
    (slug: string, locale: string, preview: boolean) => _fetchCategory(slug, locale, preview),
    ['api-cms-category'],
    { 
        tags: ['cms:category'],
        revalidate: 60 * 5 
    }
);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const c = cookies();
  const cookieLocale = ((await c).get('locale')?.value ?? process.env.DEMO_DEFAULT_LOCALE ?? 'en-GB') as 'de-DE' | 'en-GB';
  const previewHeader = request.headers.get('x-preview') === '1';
  const previewEnv = (process.env.CONTENTFUL_PREVIEW_ENABLED || 'false').trim() === 'true';
  const preview = previewHeader && previewEnv;

  const data = await cachedFetchCategory(slug, cookieLocale, preview);
  if (!data) return new NextResponse('Not found', { status: 404 });

  return NextResponse.json(data, {
    headers: {
      // 'Cache-Control': 'no-store', // safest for immediate freshness
      // or keep it very short if you want some CDN caching:
      'Cache-Control': 'no-store' // 'public, max-age=0, s-maxage=0, stale-while-revalidate=0',
    },
  });
}
