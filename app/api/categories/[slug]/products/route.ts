import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import type {
  Category,
  ProductPagedQueryResponse,
} from '@commercetools/platform-sdk';
import {
  appGetCategoryBySlug,
  appListProductsByCategoryId,
} from '@/lib/ct/categories';
import { type ProductDTO } from '@/lib/ct/dto/product';
import { mapProductToDTO } from '@/lib/ct/products';

interface ListResponse {
  categoryId: string;
  categorySlug: string;
  items: ProductDTO[];
  total: number;
  limit: number;
  offset: number;
}

async function _fetchCategoryPLP(
  slug: string,
  locale: string,
  qsString: string
): Promise<ListResponse | null> {
  const searchParams = new URLSearchParams(qsString);
  const limit = Math.max(1, Math.min(50, Number(searchParams.get('limit')) || 12));
  const offset = Math.max(0, Number(searchParams.get('offset')) || 0);

  const category: Category | null = await appGetCategoryBySlug(slug, locale);
  if (!category) return null;

  const data: ProductPagedQueryResponse = await appListProductsByCategoryId({
    categoryId: category.id,
    limit,
    offset,
  });

  const items = (data.results ?? []).map((p) => mapProductToDTO(p, locale));

  return {
    categoryId: category.id,
    categorySlug: slug,
    items,
    total: data.total ?? items.length,
    limit,
    offset,
  };
}

const cachedFetchCategoryPLP = (slug: string, locale: string, qs: string) =>
  cache(_fetchCategoryPLP, ['api-plp', slug, locale, qs], {
    tags: [`plp:cat:${slug}`],
    revalidate: 300,
  })(slug, locale, qs);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const locale = request.headers.get('x-locale') ?? process.env.DEMO_DEFAULT_LOCALE ?? 'de-DE';

  const url = new URL(request.url);
  const data = await cachedFetchCategoryPLP(slug, locale, url.searchParams.toString());

  if (!data) return new NextResponse('Not found', { status: 404 });

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
