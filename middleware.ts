import { NextResponse, type NextRequest } from 'next/server';
import { SUPPORTED_LOCALES, acceptLanguageToLocale } from '@/lib/i18n/locales';

export const config = { matcher: ['/:path*'] };

function setCTCookie(req: NextRequest, res: NextResponse) {
  let anon = req.cookies.get('ct_anonymous_id')?.value;
  if (!anon) {
    anon = crypto.randomUUID();
    res.cookies.set('ct_anonymous_id', anon, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
  }
}

function setVariant(req: NextRequest, res: NextResponse) {
  let variant = req.cookies.get('variant')?.value;
  if (!variant) {
    variant = req.nextUrl.pathname.length % 2 === 0 ? 'A' : 'B';
    res.cookies.set('variant', variant, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false,
    });
  }
}

export default function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  setCTCookie(req, res);
  setVariant(req, res);

  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/_next') || pathname.startsWith('/assets') || pathname.includes('/api/')) return;

  const seg = pathname.split('/')[1];
  if (!SUPPORTED_LOCALES.includes(seg as any)) {
    const acceptHeader = req.headers.get('accept-language') || '';
    const parsed = acceptLanguageToLocale(acceptHeader);

    const url = req.nextUrl.clone();
    url.pathname = `/${parsed}${pathname}`;
    return NextResponse.redirect(url);
  }

  return res;
}
