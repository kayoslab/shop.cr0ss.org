import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { ProductDTO } from '@/lib/ct/dto/product';
import { ProductCard } from '@/components/ProductCard';

export const dynamic = 'force-dynamic';

interface ListResponse {
  categoryId: string;
  categorySlug: string;
  items: ProductDTO[];
  total: number;
  limit: number;
  offset: number;
}

function formatPrice(p?: {
  currencyCode: string;
  centAmount: number;
  discounted?: boolean;
  discountedCentAmount?: number;
}) {
  if (!p) return '—';
  const base = (p.centAmount / 100).toFixed(2);
  if (p.discounted && p.discountedCentAmount && p.discountedCentAmount < p.centAmount) {
    const disc = (p.discountedCentAmount / 100).toFixed(2);
    return (
      <div className="flex items-baseline gap-2">
        <span className="font-semibold">
          {disc} {p.currencyCode}
        </span>
        <span className="text-xs text-gray-500 line-through">
          {base} {p.currencyCode}
        </span>
      </div>
    );
  }
  return `${base} ${p.currencyCode}`;
}

function getPrimaryImage(p: ProductDTO): { url: string; alt: string } | null {
  const v = p.variants?.[0];
  const img = v?.images?.[0];
  if (!img?.url) return null;
  const url = img.url.startsWith('//') ? `https:${img.url}` : img.url;
  return { url, alt: p.name };
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

export default async function CategoryPLP({ params }: { params: { slug: string } }) {
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
