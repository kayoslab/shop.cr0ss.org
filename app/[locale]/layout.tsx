import './globals.css';
import { notFound } from 'next/navigation';
import { Analytics } from '@vercel/analytics/next';
import Nav from '@/components/Nav';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import { SupportedLocale, isSupportedLocale } from '@/lib/i18n/locales';
import { absoluteBase } from '@/lib/networking/absoluteBase';
import { categoryTags } from '@/lib/cache/tags';

// Cache revalidation: 1 hour (see lib/config/cache.ts for values)
export const revalidate = 3600;

async function fetchCategories(locale: SupportedLocale): Promise<CategoryDTO[]> {
  try {
    const absoluteBasePath = absoluteBase();

    const res = await fetch(`${absoluteBasePath}/${locale}/api/categories`, {
      next: { revalidate: 3600, tags: [categoryTags.all(locale)] },
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

  if (!isSupportedLocale(locale)) {
    return notFound();
  }

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