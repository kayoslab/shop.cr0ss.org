import './globals.css';
import Nav from '@/components/Nav';
import { headers } from 'next/headers';
import type { CategoryDTO } from '@/lib/ct/dto/category';

async function fetchCategories(): Promise<CategoryDTO[]> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  const res = await fetch(`${base}/api/categories`, { next: { tags: ['categories'] } });
  if (!res.ok) return [];
  const data = (await res.json()) as { items: CategoryDTO[] };
  return data.items;
}

function topLevel(categories: CategoryDTO[]): CategoryDTO[] {
  return categories.filter(c => c.parentId === null);
}

function BasketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 3h1.386a1.5 1.5 0 0 1 1.414 1.043L5.7 6h12.6l1.05 7.35A3 3 0 0 1 16.38 16.5H8.13a3 3 0 0 1-2.97-2.55L4.2 6M9 10.5h6m-6 3h6M9 3l-1.5 3m7.5-3L18 6" />
    </svg>
  );
}


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const top = topLevel(await fetchCategories());

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Nav topLevel={top} />
        {children}
      </body>
    </html>
  );
}
