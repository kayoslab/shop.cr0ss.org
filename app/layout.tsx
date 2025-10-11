import './globals.css';
import { Analytics } from "@vercel/analytics/next"
import Nav from '@/components/Nav';
import { headers } from 'next/headers';
import type { CategoryDTO } from '@/lib/ct/dto/category';

export const revalidate = 3600;

async function fetchCategories(): Promise<CategoryDTO[]> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  
  const res = await fetch(`${base}/api/categories`, {
    next: { revalidate, tags: ['categories'] },
  });

  if (!res.ok) return [];
  const data = (await res.json()) as { items: CategoryDTO[] };
  return data.items;
}

function topLevel(categories: CategoryDTO[]): CategoryDTO[] {
  return categories.filter(c => c.parentId === null);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const top = topLevel(await fetchCategories());

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Nav topLevel={top} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
