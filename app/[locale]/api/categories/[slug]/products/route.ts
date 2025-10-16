import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { appGetCategoryBySlug, appListProductsByCategoryId } from '@/lib/ct/categories';
import { mapProductProjectionToDTO } from '@/lib/ct/products';
import type { Category, ProductProjectionPagedQueryResponse } from '@commercetools/platform-sdk';
import { SupportedLocale, localeToCountry, localeToCurrency, otherLocale } from '@/lib/i18n/locales';

async function _fetchCategoryPLP(
  locale: SupportedLocale,
  slug: string,
  qs: string,
  currency: string,
  country: string
) {
  const searchParams = new URLSearchParams(qs);
  const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 12));
  const offset = Math.max(0, Number(searchParams.get('offset')) || 0);

  // Try current-locale slug
  const category: Category | null = await appGetCategoryBySlug(slug, locale);

  // If not found, try the other supported locale and redirect to the canonical slug
  if (!category) {
    const foundInOther = await appGetCategoryBySlug(slug, otherLocale(locale));

    if (foundInOther) {
      // compute the canonical slug for the active locale
      const localizedSlug = foundInOther.slug?.[locale] ?? slug;

      // tell the caller to re-request the locale-correct URL (fetch follows redirects)
      const redirectQS = searchParams.toString();
      const redirectPath = `/${locale}/api/categories/${encodeURIComponent(localizedSlug)}/products${redirectQS ? `?${redirectQS}` : ''}`;
      // IMPORTANT: return the redirect from here. The caller (your page fetch) will follow it.
      throw new Response(null, { status: 308, headers: { Location: redirectPath } });
    }

    // Not found in any locale
    return null;
  }

  const data: ProductProjectionPagedQueryResponse = await appListProductsByCategoryId({
    categoryId: category.id, limit, offset,
  });

  const items = (data.results ?? []).map((p) =>
    mapProductProjectionToDTO(p, locale, { currency, country })
  );

  return {
    categoryId: category.id,
    categorySlug: slug,
    items,
    total: data.total ?? items.length,
    limit,
    offset,
  };
}

const cached = (locale: SupportedLocale, slug: string, qs: string, currency: string, country: string) =>
  cache(_fetchCategoryPLP, ['api-plp', locale, slug, qs, currency, country], {
    tags: [`plp:cat:${slug}:${locale}`],
    revalidate: 300,
  })(locale, slug, qs, currency, country);

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string; slug: string }> }
) {
  const { locale, slug } = await ctx.params;
  const typedLocale = (locale === 'de-DE' ? 'de-DE' : 'en-GB') as SupportedLocale;

  if (typedLocale !== locale) {
    return new NextResponse('Locale not supported', { status: 400 });
  }

  const url = new URL(req.url);
  const currency = url.searchParams.get('currency') ?? localeToCurrency(typedLocale);
  const country  = url.searchParams.get('country')  ?? localeToCountry(typedLocale);

  try {
    const data = await cached(typedLocale, slug, url.searchParams.toString(), currency, country);
    if (!data) return new NextResponse('Not found', { status: 404 });

    // Prefer letting unstable_cache handle caching
    // return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
    
    // Short s-maxage and vary on locale/currency/country:
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
        'Vary': 'accept-encoding, locale, currency, country',
      },
    });
  } catch (e) {
    // Bubble the redirect we threw above
    if (e instanceof Response && e.status === 308 && e.headers.get('Location')) return e;
    throw e;
  }
}
