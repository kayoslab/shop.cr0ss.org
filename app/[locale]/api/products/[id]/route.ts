import { NextResponse, type NextRequest } from 'next/server';
import type { ProductProjection } from '@commercetools/platform-sdk';
import { getProductProjectionById, mapProductProjectionToDTO } from '@/lib/ct/products';
import type { ProductProjectionDTO } from '@/lib/ct/dto/product';
import { SupportedLocale, localeToCountry, localeToCurrency, isSupportedLocale } from '@/lib/i18n/locales';

async function _fetchProduct(
  id: string,
  locale: SupportedLocale,
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
  ctx: { params: Promise<{ locale: string; id: string }> }
) {
  const { locale, id } = await ctx.params;
  const url = new URL(req.url);

  if (!isSupportedLocale(locale)) {
    return new NextResponse('Locale not supported', { status: 400 });
  }

  const currency = url.searchParams.get('currency') ?? localeToCurrency(locale);
  const country = url.searchParams.get('country') ?? localeToCountry(locale);

  const data = await _fetchProduct(id, locale, currency, country);
  if (!data) return new NextResponse('Not found', { status: 404 });

  // Product data is fast changing → don't CDN-cache the HTTP response.
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
