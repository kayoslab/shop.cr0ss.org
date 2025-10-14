import { NextResponse, type NextRequest } from 'next/server';
import type { ProductProjection } from '@commercetools/platform-sdk';
import { getProductProjectionById, mapProductToDTO } from '@/lib/ct/products';
import { type ProductDTO } from '@/lib/ct/dto/product';
import { cookies } from 'next/headers';

async function _fetchProduct(id: string, locale: string, currency: string, country: string): Promise<ProductDTO | null> {
  const p: ProductProjection | undefined = await getProductProjectionById(id, { currency, country }, locale).catch(() => undefined);
  if (!p) return null;
  return mapProductToDTO(p, locale, { currency, country });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const c = cookies();
  const cookieLocale = ((await c).get('locale')?.value ?? process.env.DEMO_DEFAULT_LOCALE ?? 'en-GB') as 'de-DE' | 'en-GB';
  const cookieCurrency = ((await c).get('currency')?.value ?? process.env.DEMO_DEFAULT_CURRENCY ?? 'GBP') as 'EUR' | 'GBP';
  const cookieCountry = ((await c).get('country')?.value ?? process.env.DEMO_DEFAULT_COUNTRY ?? 'GB') as 'DE' | 'GB';
  
  const data = await _fetchProduct(id, cookieLocale, cookieCurrency, cookieCountry);
  if (!data) return new NextResponse('Not found', { status: 404 });

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
