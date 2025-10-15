import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import type { ProductProjectionPagedQueryResponse } from '@commercetools/platform-sdk';
import { getProductProjections, mapProductProjectionToDTO } from '@/lib/ct/products';
import { type ProductProjectionDTO } from '@/lib/ct/dto/product';
import { cookies } from 'next/headers';
import { 
  SupportedLocale, 
  SupportedCountry, 
  SupportedCurrency, 
  DEFAULT_COUNTRY, 
  DEFAULT_CURRENCY, 
  DEFAULT_LOCALE 
} from '@/lib/i18n/locales';

interface ListResponse {
  items: ProductProjectionDTO[];
  total: number;
  limit: number;
  offset: number;
}

async function _fetchProducts(
  qsString: string,
  locale: SupportedLocale,
  currency: SupportedCurrency,
  country: SupportedCountry
): Promise<ListResponse> {
  const searchParams = new URLSearchParams(qsString);
  const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 35));
  const offset = Math.max(0, Number(searchParams.get('offset')) || 0);
  const data: ProductProjectionPagedQueryResponse = await getProductProjections({ limit, offset }, { currency, country }, locale);
  const items = (data.results ?? []).map((p) => mapProductProjectionToDTO(p, locale, { currency, country }));

  return { items, total: data.total ?? items.length, limit, offset };
}

const cachedFetchProducts = (
  qsString: string, 
  locale: SupportedLocale,
  currency: SupportedCurrency,
  country: SupportedCountry
) =>
  cache(_fetchProducts, ['api-products', qsString, locale, currency, country], {
    tags: ['products'],
    revalidate: 300,
  })(qsString, locale, currency, country);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  
  const c = cookies();
  const cookieLocale = ((await c).get('locale')?.value ?? DEFAULT_LOCALE) as SupportedLocale;
  const cookieCurrency = ((await c).get('currency')?.value ?? DEFAULT_CURRENCY) as SupportedCurrency;
  const cookieCountry = ((await c).get('country')?.value ?? DEFAULT_COUNTRY) as SupportedCountry;

  const data = await cachedFetchProducts(url.searchParams.toString(), cookieLocale, cookieCurrency, cookieCountry);
  // Product data is fast changing → don't CDN-cache the HTTP response.
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
