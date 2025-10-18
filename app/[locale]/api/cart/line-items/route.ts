export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getCartById, mapCartToDTO, addLineItem, createAnonymousCart } from '@/lib/ct/cart';
import { localeToCurrency, localeToCountry, type SupportedLocale, isSupportedLocale } from '@/lib/i18n/locales';

const COOKIE_PREFIX = 'cartId';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const cookieName = (locale: SupportedLocale) => `${COOKIE_PREFIX}:${locale}`;

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string }> }
) {
  const { locale } = await ctx.params;

  if (!isSupportedLocale(locale)) {
    return new NextResponse('Locale not supported', { status: 400 });
  }

  const c = cookies();

  const body = await req.json().catch(() => ({}));
  const { productId, variantId, sku, quantity } = body || {};
  if (!productId && !sku) {
    return new NextResponse('productId or sku required', { status: 400 });
  }

  // Ensure cart exists for this locale
  let cartId = (await c).get(cookieName(locale))?.value;
  let cart;
  if (cartId) {
    try {
      cart = await getCartById(cartId);
    } catch {
      cart = undefined;
    }
  }
  if (!cart) {
    cart = await createAnonymousCart({
      currency: localeToCurrency(locale),
      country: localeToCountry(locale),
      locale: locale,
    });
    cartId = cart.id;
  }

  const current = cart ?? (await getCartById(cartId!));
  const updated = await addLineItem(cartId!, current.version, {
    productId,
    variantId,
    sku,
    quantity: typeof quantity === 'number' ? quantity : 1,
  });

  const dto = mapCartToDTO(updated, locale);
  const res = NextResponse.json(dto, { headers: { 'Cache-Control': 'no-store' } });

  res.cookies.set(cookieName(locale), updated.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return res;
}
