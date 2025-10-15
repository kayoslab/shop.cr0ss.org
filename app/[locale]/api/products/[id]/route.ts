import { NextResponse, type NextRequest } from 'next/server';
import type { ProductProjection } from '@commercetools/platform-sdk';
import { getProductProjectionById, mapProductProjectionToDTO } from '@/lib/ct/products';
import type { ProductProjectionDTO } from '@/lib/ct/dto/product';

type Locale = 'de-DE' | 'en-GB';

async function _fetchProduct(
  id: string,
  locale: Locale,
  currency: string,
  country: string
): Promise<ProductProjectionDTO | null> {
  const proj: ProductProjection | undefined = await getProductProjectionById(
    id,
    { currency, country },
    locale
  ).catch(() => undefined);

  if (!proj) return null;
  return mapProductProjectionToDTO(proj, locale, { currency, country });
}

export async function GET(
  req: NextRequest,  
  ctx: { params: Promise<{ locale: Locale; id: string }> }
) {
  const { locale, id } = await ctx.params;

  const url = new URL(req.url);
  const currency = url.searchParams.get('currency') ?? (locale === 'de-DE' ? 'EUR' : 'GBP');
  const country = url.searchParams.get('country') ?? (locale === 'de-DE' ? 'DE' : 'GB');

  const data = await _fetchProduct(id, locale, currency, country);
  if (!data) return new NextResponse('Not found', { status: 404 });

  // Product data is fast changing → don't CDN-cache the HTTP response.
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
