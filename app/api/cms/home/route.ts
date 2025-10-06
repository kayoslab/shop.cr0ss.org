import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { fetchHomeFromCMS } from '@/lib/contentful/home';
import type { HomeDTO } from '@/lib/contentful/dto/home';

async function _fetchHome(locale: string, preview: boolean): Promise<HomeDTO | null> {
  return fetchHomeFromCMS(locale, preview);
}

// Cache per-locale; invalidate via tag `cms:home`
const cachedFetchHome = (locale: string, preview: boolean) =>
    cache(_fetchHome, ['api-cms-home', locale, String(preview)], {
        tags: ['cms:home'],
        revalidate: 60 * 5,
    })(locale, preview);

export async function GET(req: NextRequest) {
    const locale = req.headers.get('x-locale') ?? process.env.DEMO_DEFAULT_LOCALE ?? 'en-GB';
    const previewHeader = req.headers.get('x-preview') === '1';
    const previewEnv = String(process.env.CONTENTFUL_PREVIEW_ENABLED || 'false') === 'true';
    const preview = previewHeader && previewEnv;

    const data = await cachedFetchHome(locale, preview);
    if (!data) return new NextResponse('Not found', { status: 404 });

    return NextResponse.json(data, {
        headers: {
            'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
        },
    });
}
