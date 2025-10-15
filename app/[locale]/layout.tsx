import './globals.css';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import Nav from '@/components/Nav';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import { SupportedLocale } from '@/lib/i18n/locales';

export const revalidate = 3600;

async function fetchCategories(locale: SupportedLocale): Promise<CategoryDTO[]> {
  try {
    const h = headers();
    const proto = (await h).get('x-forwarded-proto') ?? 'http';
    const host = (await h).get('host');
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
    
    const res = await fetch(`${base}/${locale}/api/categories`, {
      next: { revalidate: 3600, tags: [`categories:${locale}`] },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: CategoryDTO[] } | CategoryDTO[] | null | undefined;

    const items = Array.isArray((data as { items?: CategoryDTO[] })?.items)
      ? ((data as { items?: CategoryDTO[] }).items as CategoryDTO[])
      : Array.isArray(data)
      ? (data as CategoryDTO[])
      : [];

    return items;
  } catch {
    return [];
  }
}

function topLevel(categories: CategoryDTO[]): CategoryDTO[] {
  if (!Array.isArray(categories)) return [];
  return categories.filter((c) => c?.parentId === null);
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // Next 15: await params
}) {
  const { locale } = await params;

  const typedLocale = (locale === 'de-DE' ? 'de-DE' : 'en-GB') as SupportedLocale;
  if (typedLocale !== locale) {
    return notFound();
  }
  
  const categories = await fetchCategories(typedLocale);
  const top = topLevel(categories);

  return (
    <html lang={typedLocale} className="h-full">
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Nav topLevel={top} locale={typedLocale} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}