import { NextResponse } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import type { Product } from '@commercetools/platform-sdk';
import { getProductById } from '@/lib/ct/queries';
import { productToDTO, type ProductDTO } from '@/lib/ct/dto/product';

async function _fetchProduct(id: string, locale: string): Promise<ProductDTO | null> {
  const p: Product | undefined = await getProductById(id).catch(() => undefined);
  if (!p) return null;
  return productToDTO(p, locale);
}

const cachedFetchProduct = (id: string, locale: string) =>
  cache(_fetchProduct, ['api-product', id, locale], {
    tags: [`product:${id}`],
    revalidate: 300,
  })(id, locale);

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const locale = req.headers.get('x-locale') ?? process.env.DEMO_DEFAULT_LOCALE ?? 'de-DE';

  const data = await cachedFetchProduct(params.id, locale);
  if (!data) return new NextResponse('Not found', { status: 404 });

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
    },
  });
}
