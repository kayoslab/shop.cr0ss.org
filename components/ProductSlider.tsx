import { headers } from 'next/headers';
import type { ProductDTO } from '@/lib/ct/dto/product';
import ProductStrip from './ProductStripClient';

interface ListResponse {
  items: ProductDTO[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchRecommended(limit = 12): Promise<ProductDTO[]> {
  const h = headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  const res = await fetch(`${base}/api/products?limit=${limit}`, { next: { tags: ['products'] } });
  if (!res.ok) return [];
  const data = (await res.json()) as ListResponse;
  return data.items;
}

export default async function ProductSlider() {
  const items = await fetchRecommended(12);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold">Recommended</h2>
      </div>
      <ProductStrip items={items} />
    </section>
  );
}
