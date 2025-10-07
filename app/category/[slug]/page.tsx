import Link from 'next/link';
import Image from 'next/image';
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

function getPrimaryImage(p: ProductDTO): { url: string; alt: string } | null {
  const v = p.variants?.[0];
  const img = v?.images?.[0];
  if (!img?.url) return null;
  const url = img.url.startsWith('//') ? `https:${img.url}` : img.url;
  return { url, alt: p.name };
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
          const img = getPrimaryImage(p);
          return (
            <li
              key={p.id}
              className="rounded-xl border bg-white p-3 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
            >
              <Link href={`/products/${p.id}`} className="block">
                {/* Image wrapper with inner padded layer; object-contain prevents cropping */}
                <div className="relative mb-3 aspect-[4/5] w-full overflow-hidden rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-900">
                  <div className="absolute inset-0 p-3">
                    {img && (
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        priority={false}
                      />
                    )}
                  </div>
                </div>

                <div className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">{p.name}</div>
              </Link>

              <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                {formatPrice(p.variants?.[0]?.price as any)}
              </div>

              <div className="mt-3">
                <Link
                  href={`/products/${p.id}`}
                  className="inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                >
                  View details
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
