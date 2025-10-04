import Link from 'next/link';
import { headers } from 'next/headers';
import type { CategoryDTO } from '@/lib/ct/dto/category';

// Simple inline SVGs (no extra deps)
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

function CategoryTree({ nodes }: { nodes: CategoryDTO[] }) {
  return (
    <ul className="pl-3 space-y-1">
      {nodes.map((n) => (
        <li key={n.id}>
          <Link href={`/category/${n.slug}`} className="hover:underline">
            {n.name}
          </Link>
          {n.children.length > 0 && (
            <div className="mt-1 border-l border-gray-200 dark:border-gray-700 ml-2">
              <CategoryTree nodes={n.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function Nav() {
  const categories = await fetchCategories();

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Demo Store
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {/* Categories dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white">
                Categories
              </button>
              <div className="invisible absolute left-0 mt-2 w-[28rem] rounded-xl border bg-white p-4 shadow-xl opacity-0 transition-all group-hover:visible group-hover:opacity-100 dark:border-gray-800 dark:bg-gray-900">
                {categories.length === 0 ? (
                  <div className="text-sm text-gray-500">No categories</div>
                ) : (
                  <CategoryTree nodes={categories} />
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Right: Basket */}
        <div className="flex items-center gap-4">
          <Link href="/cart" className="relative inline-flex items-center">
            <BasketIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            {/* Placeholder count */}
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">0</span>
          </Link>
        </div>
      </div>

      {/* Mobile secondary row */}
      <div className="md:hidden border-t px-4 py-2 bg-white dark:bg-gray-900">
        <nav className="flex items-center gap-6">
          <Link href="/categories" className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white">
            Categories
          </Link>
          <Link href="/cart" className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white">
            Cart
          </Link>
        </nav>
      </div>
    </header>
  );
}
