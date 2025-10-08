import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { fetchHomeFromCMS } from '@/lib/contentful/home';
import type { HomeDTO } from '@/lib/contentful/dto/home';

async function _fetchHome(locale: string, preview: boolean): Promise<HomeDTO | null> {
  return fetchHomeFromCMS(locale, preview);
}

const cachedFetchHome = cache(
    (locale: string, preview: boolean) => _fetchHome(locale, preview),
    ['api-cms-home'],
    { 
        tags: ['cms:home'],
        revalidate: 60 * 5 
    }
);

export async function GET(req: NextRequest) {
  const locale = req.headers.get('x-locale') ?? process.env.DEMO_DEFAULT_LOCALE ?? 'en-GB';
  const previewHeader = req.headers.get('x-preview') === '1';
  const previewEnv = (process.env.CONTENTFUL_PREVIEW_ENABLED || 'false').trim() === 'true';
  const preview = previewHeader && previewEnv;

  const data = await cachedFetchHome(locale, preview);
  if (!data) return new NextResponse('Not found', { status: 404 });

  return NextResponse.json(data, {
    headers: {
      // 'Cache-Control': 'no-store', // safest for immediate freshness
      // or keep it very short if you want some CDN caching:
      'Cache-Control': 'public, max-age=0, s-maxage=0, stale-while-revalidate=0',
    },
  });
}
