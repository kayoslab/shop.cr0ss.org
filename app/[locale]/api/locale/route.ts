import { NextResponse, type NextRequest } from 'next/server';

const SUPPORTED = ['de-DE', 'en-GB'] as const;
type SupportedLocale = (typeof SUPPORTED)[number];

export async function POST(req: NextRequest) {
  let locale: string | undefined;
  try {
    const body = await req.json();
    locale = body?.locale;
  } catch { /* ignore */ }

  if (!locale || !SUPPORTED.includes(locale as SupportedLocale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  res.cookies.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
  });

  const currency = locale === 'de-DE' ? 'EUR' : 'GBP';
  res.cookies.set('currency', currency, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
  });

  return res;
}
