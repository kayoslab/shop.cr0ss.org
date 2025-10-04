import Link from 'next/link';
import type { ProductDTO } from '@/lib/ct/dto/product';

interface ListResponse {
  items: ProductDTO[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchProducts(): Promise<ListResponse> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const res = await fetch(`${base}/api/products`);
  if (!res.ok) throw new Error('Failed to load products');
  return res.json() as Promise<ListResponse>;
}

export default async function ProductsPage() {
  const data = await fetchProducts();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Products (Headless via /api)</h1>
      <ul className="grid grid-cols-2 gap-4">
        {data.items.map((p) => (
          <li key={p.id} className="border rounded p-4">
            <div className="font-medium">{p.name}</div>
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt={p.name} className="mt-2 rounded" />
            ) : null}
            <div className="text-sm text-gray-500 mt-1">
              {p.price ? `${(p.price.amount / 100).toFixed(2)} ${p.price.currency}` : 'No price'}
            </div>
            {/* Link by ID for now to match /api/products/[id] */}
            <Link className="text-blue-600" href={`/products/${p.id}`}>
              View
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
