import type { ProductProjectionDTO } from '@/lib/ct/dto/product';
import { ProductCard } from '@/components/ProductCard';
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import { getAllCategorySlugs } from '@/lib/ct/categories';
import { fetchFullPLPData } from '@/lib/helpers/plpData';

// Cache revalidation: 10 minutes (see lib/config/cache.ts for values)
export const revalidate = 600;

// Enable ISR for dynamic category pages not pre-rendered at build time
export const dynamicParams = true;

/**
 * Pre-render category pages at build time for ISR
 * This enables proper cache headers (max-age=600) instead of dynamic rendering
 */
export async function generateStaticParams() {
  const params: { locale: SupportedLocale; slug: string }[] = [];

  // Fetch categories for each locale
  for (const locale of SUPPORTED_LOCALES) {
    try {
      const slugs = await getAllCategorySlugs(locale);
      
      // Add all category slugs for this locale
      for (const slug of slugs) {
        params.push({ locale, slug });
      }
    } catch (error) {
      console.error(`Failed to fetch category slugs for locale ${locale}:`, error);
    }
  }

  return params;
}

export default async function CategoryPage({
  params, searchParams,
}: {
  params: Promise<{ locale: SupportedLocale; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale, slug } = await params;
  const sp = await searchParams;
  
  const { plp: plpRaw, cms } = await fetchFullPLPData(locale, slug, sp);

  if (!plpRaw) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-2xl font-semibold">Category not found</h1>
        <p className="mt-2 text-gray-600">Please check the link or choose a different category.</p>
      </main>
    );
  }

  const items: ProductProjectionDTO[] = Array.isArray(plpRaw.items)
    ? plpRaw.items
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
                src={cms?.imageUrl}
                alt={cms?.slug || 'Category'}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>

            {/* Text */}
            <div className="prose max-w-none self-start dark:prose-invert">
              <h1 className="mb-2 text-2xl font-semibold">{cms?.title ?? cms?.slug}</h1>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{cms?.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Product list */}
      <section aria-labelledby="plp-heading" className="py-16">
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