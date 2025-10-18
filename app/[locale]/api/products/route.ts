import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import type { ProductProjectionPagedQueryResponse } from '@commercetools/platform-sdk';
import { getProductProjections, mapProductProjectionToDTO } from '@/lib/ct/products';
import type { ProductProjectionDTO } from '@/lib/ct/dto/product';
import {
  SupportedLocale,
  SupportedCountry,
  SupportedCurrency,
  DEFAULT_COUNTRY,
  DEFAULT_CURRENCY,
  DEFAULT_LOCALE,
  isSupportedLocale,
} from '@/lib/i18n/locales';
import { productTags } from '@/lib/cache/tags';

type ListResponse = {
  items: ProductProjectionDTO[];
  total: number;
  limit: number;
  offset: number;
};

async function _fetchProducts(
  qsString: string,
  locale: SupportedLocale,
  currency: SupportedCurrency,
  country: SupportedCountry
): Promise<ListResponse> {
  const sp = new URLSearchParams(qsString);
  const limit = Math.max(1, Math.min(50, Number(sp.get('limit')) || 35));
  const offset = Math.max(0, Number(sp.get('offset')) || 0);

  const data: ProductProjectionPagedQueryResponse = await getProductProjections(
    { limit, offset },
    { currency, country },
    locale
  );

  const items = (data.results ?? []).map((p) =>
    mapProductProjectionToDTO(p, locale, { currency, country })
  );

  return { items, total: data.total ?? items.length, limit, offset };
}

// cache key + tag include locale so revalidation can be per-locale
const cachedFetchProducts = (
  qsString: string,
  locale: SupportedLocale,
  currency: SupportedCurrency,
  country: SupportedCountry
) =>
  cache(_fetchProducts, ['api-products', qsString, locale, currency, country], {
    tags: [productTags.all(locale)],
    revalidate: 300,
  })(qsString, locale, currency, country);

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string }> } // Next 15: params is a Promise
) {
  const { locale } = await ctx.params;

  if (!isSupportedLocale(locale)) {
    return new NextResponse('Locale not supported', { status: 400 });
  }

  const url = new URL(req.url);

  const currency = (url.searchParams.get('currency') as SupportedCurrency) ?? DEFAULT_CURRENCY;
  const country  = (url.searchParams.get('country')  as SupportedCountry)  ?? DEFAULT_COUNTRY;

  const data = await cachedFetchProducts(url.searchParams.toString(), locale, currency, country);

  // Let unstable_cache handle freshness; keep HTTP response non-cacheable
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });

  // Short s-maxage and vary on locale/currency/country:
  // return NextResponse.json(data, {
  //   headers: {
  //     'Cache-Control': 'public, max-age=0, s-maxage=120, stale-while-revalidate=30',
  //     'Vary': 'accept-encoding, locale, currency, country',
  //   },
  // });
}
