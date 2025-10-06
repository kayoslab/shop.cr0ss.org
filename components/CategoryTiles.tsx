import Link from 'next/link';
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

// Create a list of all categories (flat).
function flattenCategories(categories: CategoryDTO[]): CategoryDTO[] {
  const flat: CategoryDTO[] = [];
  categories.forEach(c => {
    flat.push(c);
    if (c.children) {
      flat.push(...flattenCategories(c.children));
    }
  });
  return flat;
}

export default async function CategoryTiles({
  heading = 'Shop by Category',
  featuredSlugs,
}: {
  heading?: string;
  featuredSlugs?: string[];
}) {
  const cats = flattenCategories(await fetchCategories());

  const chosen = featuredSlugs && featuredSlugs.length
    ? cats.filter(c => featuredSlugs.includes(c.slug))
    : cats.slice(0, 8);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold">{heading}</h2>
        <Link className="text-sm text-blue-600 hover:underline" href="/category">
          View all
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {chosen.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className="group relative overflow-hidden rounded-xl border bg-white p-5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-60 group-hover:opacity-80 dark:from-gray-900 dark:to-gray-950" />
            <div className="relative">
              <div className="h-24 w-full rounded-lg bg-gray-100 dark:bg-gray-900" />
              <div className="mt-3 text-base font-medium">{c.name}</div>
              <div className="text-xs text-gray-500">Explore</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
