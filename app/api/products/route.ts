import { NextResponse } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import type { ProductPagedQueryResponse } from '@commercetools/platform-sdk';
import { getProducts } from '@/lib/ct/queries';
import { productToDTO, type ProductDTO } from '@/lib/ct/dto/product';

interface ListResponse {
  items: ProductDTO[];
  total: number;
  limit: number;
  offset: number;
}

async function _fetchProducts(qsString: string, locale: string): Promise<ListResponse> {
  const searchParams = new URLSearchParams(qsString);
  const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 12));
  const offset = Math.max(0, Number(searchParams.get('offset')) || 0);

  const data: ProductPagedQueryResponse = await getProducts({ limit, offset });
  const items = (data.results ?? []).map((p) => productToDTO(p, locale));

  return {
    items,
    total: data.total ?? items.length,
    limit,
    offset,
  };
}

// cache key contains inputs; no cookies() calls inside
const cachedFetchProducts = (qsString: string, locale: string) =>
  cache(_fetchProducts, ['api-products', qsString, locale], {
    tags: ['products'],
    revalidate: 300,
  })(qsString, locale);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = req.headers.get('x-locale') ?? process.env.DEMO_DEFAULT_LOCALE ?? 'de-DE';

  const data = await cachedFetchProducts(url.searchParams.toString(), locale);
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
    },
  });
}