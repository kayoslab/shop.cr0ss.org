import { NextResponse, type NextRequest } from 'next/server';
import type { Product } from '@commercetools/platform-sdk';
import { getProductById, mapProductToDTO } from '@/lib/ct/products';
import { type ProductDTO } from '@/lib/ct/dto/product';

async function _fetchProduct(id: string, locale: string): Promise<ProductDTO | null> {
  const p: Product | undefined = await getProductById(id).catch(() => undefined);
  if (!p) return null;
  return mapProductToDTO(p, locale);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const locale = request.headers.get('x-locale') ?? process.env.DEMO_DEFAULT_LOCALE ?? 'de-DE';

  const data = await _fetchProduct(id, locale);
  if (!data) return new NextResponse('Not found', { status: 404 });

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
