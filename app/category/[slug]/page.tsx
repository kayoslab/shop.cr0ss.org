import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { ProductDTO } from '@/lib/ct/dto/product';

export const dynamic = 'force-dynamic';

interface ListResponse {
  categoryId: string;
  categorySlug: string;
  items: ProductDTO[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchCategoryPLP(slug: string): Promise<ListResponse | null> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  const res = await fetch(`${base}/api/categories/${slug}/products`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load category PLP');
  return res.json() as Promise<ListResponse>;
}

export default async function CategoryPLP({
  params,
}: {
  params: { slug: string };
}) {
  const data = await fetchCategoryPLP((await params).slug);
  if (!data) return notFound();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">
          Category: <span className="font-normal">{data.categorySlug}</span>
        </h1>
        <div className="text-sm text-gray-500">{data.total} products</div>
      </div>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data.items.map((p) => (
          <li key={p.id} className="border rounded p-4">
            <div className="font-medium">{p.name}</div>
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt={p.name} className="mt-2 rounded" />
            ) : null}
            <div className="text-sm text-gray-500 mt-1">
              {p.price
                ? `${(p.price.amount / 100).toFixed(2)} ${p.price.currency}`
                : 'No price'}
            </div>
            <Link className="text-blue-600" href={`/products/${p.id}`}>
              View
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
