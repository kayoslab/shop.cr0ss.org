import { NextResponse, type NextRequest } from 'next/server';

export const config = { matcher: ['/:path*'] };
export default function middleware(req: NextRequest) {
  const res = NextResponse.next();
  let anon = req.cookies.get('ct_anonymous_id')?.value;
  if (!anon) {
    anon = crypto.randomUUID();
    res.cookies.set('ct_anonymous_id', anon, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: true,
      httpOnly: false,
    });
  }

  const accept = req.headers.get('accept-language') || '';
  const locale = accept.startsWith('de') ? 'de-DE' : 'en-GB';
  const currency = locale === 'de-DE' ? 'EUR' : 'GBP';
  const variant = req.nextUrl.pathname.length % 2 === 0 ? 'A' : 'B';

  res.headers.set('x-locale', locale);
  res.headers.set('x-currency', currency);
  res.headers.set('x-variant', variant);

  return res;
}
