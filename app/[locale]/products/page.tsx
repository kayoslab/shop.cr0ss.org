import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { ProductDTO } from '@/lib/ct/dto/product';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

interface ListResponse {
  items: ProductDTO[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchProducts(): Promise<ListResponse | null> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  const cookie = (await h).get('cookie') ?? '';
  const res = await fetch(`${base}/api/products`, 
    { 
      headers: { cookie },
      // next: { tags: ['products'] },
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load products');
  return res.json() as Promise<ListResponse>;
}

export default async function ProductsPage() {
  const data = await fetchProducts();
  if (!data) return notFound();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      <ul className="grid grid-cols-7 gap-4">
        {data.items.map((p) => {
          return (
            <li key={p.id}>
              <ProductCard product={p} compact={false} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}