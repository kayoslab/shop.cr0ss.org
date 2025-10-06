import Link from 'next/link';
import { headers } from 'next/headers';
import type { CategoryDTO } from '@/lib/ct/dto/category';

function BasketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 3h1.386a1.5 1.5 0 0 1 1.414 1.043L5.7 6h12.6l1.05 7.35A3 3 0 0 1 16.38 16.5H8.13a3 3 0 0 1-2.97-2.55L4.2 6M9 10.5h6m-6 3h6M9 3l-1.5 3m7.5-3L18 6" />
    </svg>
  );
}

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

export default async function Nav() {
  const top = topLevel(await fetchCategories());

  // Show first N inline; rest go into "More"
  const MAX_INLINE = 6;
  const inline = top.slice(0, MAX_INLINE);
  const overflow = top.slice(MAX_INLINE);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: Brand + primary nav */}
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="shrink-0 text-lg font-semibold tracking-tight">
            Demo Store
          </Link>

          {/* Desktop primary nav */}
          <nav className="hidden md:flex items-center gap-5">
            {inline.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
              >
                {c.name}
              </Link>
            ))}

            {overflow.length > 0 && (
              <div className="relative group">
                <button className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white">
                  More
                </button>
                <div className="invisible absolute left-0 mt-2 min-w-[16rem] rounded-xl border bg-white p-3 shadow-xl opacity-0 transition-all group-hover:visible group-hover:opacity-100 dark:border-gray-800 dark:bg-gray-900">
                  <ul className="space-y-1">
                    {overflow.map(c => (
                      <li key={c.id}>
                        <Link
                          href={`/category/${c.slug}`}
                          className="block rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Right: Basket */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative inline-flex items-center">
            <BasketIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            {/* Replace with real count later */}
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">0</span>
          </Link>
        </div>
      </div>

      {/* Mobile category scroller */}
      <div className="md:hidden border-t px-2 py-2 bg-white dark:bg-gray-900">
        <nav className="flex items-center gap-3 overflow-x-auto scrollbar-none">
          {top.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="shrink-0 rounded-full border px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
