import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { ProductDTO, ProductProjectionDTO } from '@/lib/ct/dto/product';
import { ProductCard } from '@/components/ProductCard';
import { SupportedLocale, localeToCountry, localeToCurrency } from '@/lib/i18n/locales';
import { CategoryCMSContentDTO } from '../../api/cms/categories/[slug]/route';

export const revalidate = 600;

interface ListResponse {
  categoryId: string;
  categorySlug: string;
  items: ProductDTO[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchPLP(
  locale: SupportedLocale,
  slug: string,
  searchParams: Record<string, string | string[] | undefined>
): Promise<ListResponse | null> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');

  const limit = typeof searchParams.limit === 'string' ? searchParams.limit : '24';
  const offset = typeof searchParams.offset === 'string' ? searchParams.offset : '0';

  const qs = new URLSearchParams({
    limit,
    offset,
    currency: localeToCurrency(locale),
    country: localeToCountry(locale),
  }).toString();

  const res = await fetch(`${base}/${locale}/api/categories/${slug}/products?${qs}`, {
    next: { revalidate, tags: [`plp:cat:${slug}:${locale}`] },
  });
  if (!res.ok) return null;
  return (await res.json()) as ListResponse;
}

async function fetchCategoryContentFromCMS(locale: SupportedLocale, slug: string): Promise<CategoryCMSContentDTO | null> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  
  const res = await fetch(`${base}/${locale}/api/cms/categories/${slug}`, {
    next: { tags: [`categories:${locale}`] },
  });
  if (!res.ok) return null;
  return res.json() as Promise<CategoryCMSContentDTO>;
}

export default async function CategoryPage({
  params, searchParams,
}: {
  params: { locale: SupportedLocale; slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  const [plpRaw, cms] = await Promise.all([fetchPLP(locale, slug, sp), fetchCategoryContentFromCMS(locale, slug)]);

  if (!plpRaw) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Category not found</h1>
        <p className="mt-2 text-gray-600">Please check the link or choose a different category.</p>
      </main>
    );
  }

  const items: ProductProjectionDTO[] = Array.isArray((plpRaw as any)?.items)
    ? (plpRaw.items as ProductProjectionDTO[])
    : [];
  const total = typeof plpRaw.total === 'number' ? plpRaw.total : items.length;
  const showIntro = Boolean(cms?.description && cms?.imageUrl);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Category intro (CMS enrichment) */}
      {showIntro && (
        <section className="mb-10 rounded-2xl border bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950 md:p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
            {/* Image — square, vertically centered in its column on md+ */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-white dark:border-gray-800 dark:bg-gray-950 md:self-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cms?.imageUrl!}
                alt={cms?.slug || 'Category'}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>

            {/* Text */}
            <div className="prose max-w-none self-start dark:prose-invert">
              <h1 className="mb-2 text-2xl font-semibold">{cms?.slug}</h1>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{cms?.description}</p>
            </div>
          </div>
        </section>
      )}



      {/* Product list */}
      <section aria-labelledby="plp-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="plp-heading" className="text-xl font-semibold">
            Products
          </h2>
          <p className="text-sm text-gray-500">
            Showing {items.length} of {total}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-gray-600">No products found.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => {
          return (
            <li key={p.id}>
              <ProductCard product={p} compact={false} locale={locale} />
            </li>
          );
        })}
      </ul>
        )}
      </section>
    </main>
  );
}