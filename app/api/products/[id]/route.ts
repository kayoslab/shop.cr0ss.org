import { NextResponse } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import { getProductById } from '@/lib/ct/queries';
import { toDTO } from '@/lib/ct/dto/product';

async function _fetchProduct(id: string, locale: string) {
  const p = await getProductById(id);
  if (!p) return null;
  return toDTO(p, locale);
}

const cachedFetchProduct = (id: string, locale: string) =>
  cache(
    _fetchProduct,
    ['api-product', id, locale],
    { tags: [`product:${id}`], revalidate: 300 }
  )(id, locale);

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const locale = req.headers.get('x-locale') ?? process.env.DEMO_DEFAULT_LOCALE ?? 'de-DE';

  const data = await cachedFetchProduct(params.id, locale);
  if (!data) return new NextResponse('Not found', { status: 404 });

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60' },
  });
}
