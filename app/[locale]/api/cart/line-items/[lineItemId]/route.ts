export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getCartById, changeLineItemQuantity, removeLineItem, mapCartToDTO } from '@/lib/ct/cart';
import type { SupportedLocale } from '@/lib/i18n/locales';

const COOKIE_PREFIX = 'cartId';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;
const cookieName = (locale: SupportedLocale) => `${COOKIE_PREFIX}:${locale}`;

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string; lineItemId: string }> }
) {
  const { locale, lineItemId } = await ctx.params;

  const typedLocale = (locale === 'de-DE' ? 'de-DE' : 'en-GB') as SupportedLocale;

  if (typedLocale !== locale) {
    return new NextResponse('Locale not supported', { status: 400 });
  }

  const c = cookies();
  const cartId = (await c).get(cookieName(typedLocale))?.value;
  if (!cartId) return new NextResponse('No cart', { status: 400 });

  const body = await req.json().catch(() => ({}));
  const quantity = Number(body?.quantity);
  if (!Number.isFinite(quantity) || quantity < 0) {
    return new NextResponse('quantity must be >= 0', { status: 400 });
  }

  const current = await getCartById(cartId);
  const updated =
    quantity === 0
      ? await removeLineItem(cartId, current.version, lineItemId)
      : await changeLineItemQuantity(cartId, current.version, lineItemId, quantity);

  const dto = mapCartToDTO(updated, typedLocale);
  const res = NextResponse.json(dto, { headers: { 'Cache-Control': 'no-store' } });
  res.cookies.set(cookieName(typedLocale), updated.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  return res;
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ locale: string; lineItemId: string }> }
) {
  const { locale, lineItemId } = await ctx.params;
  const typedLocale = (locale === 'de-DE' ? 'de-DE' : 'en-GB') as SupportedLocale;

  if (typedLocale !== locale) {
    return new NextResponse('Locale not supported', { status: 400 });
  }

  const c = cookies();
  const cartId = (await c).get(cookieName(typedLocale))?.value;
  if (!cartId) return new NextResponse('No cart', { status: 400 });

  const current = await getCartById(cartId);
  const updated = await removeLineItem(cartId, current.version, lineItemId);

  const dto = mapCartToDTO(updated, typedLocale);
  const res = NextResponse.json(dto, { headers: { 'Cache-Control': 'no-store' } });
  res.cookies.set(cookieName(typedLocale), updated.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
  
  return res;
}
