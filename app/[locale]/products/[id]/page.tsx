import AddToBasketClient from '@/components/pdp/AddToBasketClient';
import ProductGalleryClient from '@/components/pdp/ProductGalleryClient';
import type { ProductProjectionDTO } from '@/lib/ct/dto/product';
import { SupportedLocale, localeToCountry, localeToCurrency, SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import { absoluteBase } from '@/lib/networking/absoluteBase';
import { formatMoney } from '@/lib/utils/formatPrice';
import { PLACEHOLDER_IMAGES } from '@/lib/config/placeholders';

export const runtime = 'edge';
export const revalidate = 0;

async function fetchProduct(id: string, locale: SupportedLocale): Promise<ProductProjectionDTO | null> {
  const absoluteBasePath = absoluteBase();
  const qs = new URLSearchParams({ currency: localeToCurrency(locale), country: localeToCountry(locale) }).toString();

  const res = await fetch(`${absoluteBasePath}/${locale}/api/products/${id}${qs ? `?${qs}` : ''}`, 
    { cache: 'no-store' }
  );
  
  if (!res.ok) return null;

  return res.json() as Promise<ProductProjectionDTO | null>;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const localeTyped = locale as SupportedLocale;
  if (!SUPPORTED_LOCALES.includes(localeTyped)) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Invalid locale</h1>
        <p className="mt-2 text-gray-600">Please check the link or go back to Products.</p>
      </main>
    );
  }
  
  const product = await fetchProduct(id, localeTyped);

  if (!product) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-2 text-gray-600">Please check the link or go back to Products.</p>
      </main>
    );
  }
  
  // Use master variant or first variant as fallback
  const master = product.variants.find(v => v.id === product.masterVariantId) ?? product.variants[0];
  const price = master?.price
    ? { currencyCode: master.price.currencyCode, centAmount: master.price.centAmount }
    : undefined;
  const discounted = master?.price?.discountedCentAmount
    ? { currencyCode: master.price.currencyCode, centAmount: master.price.discountedCentAmount }
    : undefined;

  const gallery = master?.images?.length ? master.images : [{ url: PLACEHOLDER_IMAGES.PRODUCT, alt: 'Product' }];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <ProductGalleryClient images={gallery} productName={product.name} />
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <div className="mt-3">{formatMoney(price, discounted)}</div>

          {/* Variant information (demo app - variant selection not implemented) */}
          {product.variants.length > 1 && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This product has {product.variants.length} variants. Showing master variant.
              </p>
            </div>
          )}

          {/* Add to basket (client) */}
          <div className="mt-6">
            <AddToBasketClient product={product} locale={localeTyped} />
          </div>

          {/* Description */}
          {product.descriptionHtml && (
            <section className="prose prose-gray mt-8 max-w-none dark:prose-invert">
              <h2>Description</h2>
              <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
            </section>
          )}

          {/* Specifications */}
          {product.specifications.length > 0 && (
            <section className="mt-8">
              <h3 className="mb-2 text-lg font-semibold">Specifications</h3>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-gray-200 pt-4 text-sm dark:border-gray-800 md:grid-cols-2">
                {product.specifications.map((s, i) => (
                  <div key={i} className="grid grid-cols-3">
                    <dt className="col-span-1 text-gray-500">{s.name}</dt>
                    <dd className="col-span-2 font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
