import './globals.css';
import { Analytics } from "@vercel/analytics/next"
import Nav from '@/components/Nav';
import { cookies, headers } from 'next/headers';
import type { CategoryDTO } from '@/lib/ct/dto/category';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function fetchCategories(locale: 'de-DE' | 'en-GB'): Promise<CategoryDTO[]> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host  = (await h).get('host');
  const base  = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : 'http://localhost:3000');
  const cookie = (await h).get('cookie') ?? '';

  const res = await fetch(`${base}/api/categories`, {
    cache: 'no-store',
    // next: { revalidate: 3600, tags: ['categories', locale] },
    headers: {
      cookie,
      'x-locale': locale,
    },
  });

  if (!res.ok) return [];
  const data = (await res.json()) as { items: CategoryDTO[] };
  return data.items;
}

function topLevel(categories: CategoryDTO[]): CategoryDTO[] {
  return categories.filter(c => c.parentId === null);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {  
  const c = cookies();
  const cookieLocale = ((await c).get('locale')?.value ?? process.env.DEMO_DEFAULT_LOCALE ?? 'en-GB') as 'de-DE' | 'en-GB';
  const categories = await fetchCategories(cookieLocale);
  const top = topLevel(categories);

  return (
    <html lang={cookieLocale} className="h-full">
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Nav topLevel={top} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
