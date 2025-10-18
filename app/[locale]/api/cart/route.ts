export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { localeToCountry, localeToCurrency, type SupportedLocale, isSupportedLocale } from '@/lib/i18n/locales';
import { createAnonymousCart, getCartById, mapCartToDTO, recalculateCart } from '@/lib/ct/cart';

const COOKIE_PREFIX = 'cartId';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const cookieName = (locale: SupportedLocale) => `${COOKIE_PREFIX}:${locale}`;

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ locale: string }> }
) {
  const { locale } = await ctx.params;

  if (!isSupportedLocale(locale)) {
    return new NextResponse('Locale not supported', { status: 400 });
  }

  const c = cookies();
  const name = cookieName(locale);
  const existing = (await c).get(name)?.value;

  const wantedCurrency = localeToCurrency(locale);
  const wantedCountry  = localeToCountry(locale);

  let cart;
  if (existing) {
    try {
      cart = await getCartById(existing);
      // If currency mismatches (e.g., user switched locale), start a new cart for this locale
      const cartCurrency = cart.totalPrice?.currencyCode;
      if (cartCurrency && cartCurrency !== wantedCurrency) {
        cart = undefined;
      }
    } catch {
      cart = undefined;
    }
  }

  if (!cart) {
    cart = await createAnonymousCart({
      currency: wantedCurrency,
      country: wantedCountry,
      locale: locale,
    });
  }

  try {
  cart = await recalculateCart(cart.id, cart.version, { updateProductData: true });
  } catch { /* ignore recalc errors */ }

  const dto = mapCartToDTO(cart, locale);
  const res = NextResponse.json(dto, { 
    headers: { 'Cache-Control': 'no-store' } 
  });

  // set/update the per-locale cookie
  res.cookies.set(name, cart.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });

  return res;
}