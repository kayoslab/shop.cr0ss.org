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

function Tree({ nodes }: { nodes: CategoryDTO[] }) {
  return (
    <ul className="space-y-1">
      {nodes.map(n => (
        <li key={n.id}>
          <div className="font-medium">{n.name}</div>
          {n.children.length > 0 && (
            <div className="ml-4 border-l pl-4">
              <Tree nodes={n.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function CategoriesPage() {
  const cats = await fetchCategories();
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Categories</h1>
      <Tree nodes={cats} />
    </main>
  );
}
