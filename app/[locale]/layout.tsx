import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import Nav from '@/components/Nav';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import { headers } from 'next/headers';

export const revalidate = 3600;

async function fetchCategories(locale: 'de-DE' | 'en-GB'): Promise<CategoryDTO[]> {
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

    const items = Array.isArray((data as any)?.items)
      ? ((data as any).items as CategoryDTO[])
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
  params: Promise<{ locale: 'de-DE' | 'en-GB' }>;
}) {
  const { locale } = await params;
  const categories = await fetchCategories(locale);
  const top = topLevel(categories);

  return (
    <html lang={locale} className="h-full">
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Nav topLevel={top} locale={locale} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
