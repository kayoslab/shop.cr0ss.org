import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { ProductDTO } from '@/lib/ct/dto/product';
import { ProductCard } from '@/components/ProductCard';
import { SupportedLocale, localeToCountry, localeToCurrency } from '@/lib/i18n/locales';

export const revalidate = 600;

interface ListResponse {
  categoryId: string;
  categorySlug: string;
  items: ProductDTO[];
  total: number;
  limit: number;
  offset: number;
}

export default async function CategoryPage({
  params, searchParams,
}: {
  params: { locale: SupportedLocale; slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const h = headers();

  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');

  const limit  = (typeof sp.limit  === 'string' ? sp.limit  : '100');
  const offset = (typeof sp.offset === 'string' ? sp.offset : '0');
  const currency = (typeof sp.currency === 'string' ? sp.currency : localeToCurrency(locale));
  const country  = (typeof sp.country  === 'string' ? sp.country  : localeToCountry(locale));

  const qs = new URLSearchParams({ limit, offset, currency, country }).toString();

  const res = await fetch(`${base}/${locale}/api/categories/${slug}/products?${qs}`, {
    next: { revalidate: 600, tags: [`plp:cat:${slug}:${locale}`] },
  });

  if (!res.ok) return notFound();
  const data = await res.json() as ListResponse;
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
              <ProductCard product={p} compact={false} locale={locale} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}