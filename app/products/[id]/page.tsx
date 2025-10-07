import { headers } from 'next/headers';
import VariantPickerClient from '@/components/pdp/VariantPickerClient';
import AddToBasketClient from '@/components/pdp/AddToBasketClient';

type Money = { currencyCode: string; centAmount: number };

function formatMoney(m?: Money, discounted?: Money) {
  if (!m) return '';
  const base = (m.centAmount / 100).toFixed(2);
  const code = m.currencyCode;
  if (discounted) {
    const disc = (discounted.centAmount / 100).toFixed(2);
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold">{disc} {code}</span>
        <span className="text-sm text-gray-500 line-through">{base} {code}</span>
      </div>
    );
  }
  return <span className="text-2xl font-semibold">{base} {code}</span>;
}

async function fetchProduct(id: string) {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  const res = await fetch(`${base}/api/products/${id}`, { next: { tags: [`product:${id}`, 'products'] } });
  if (!res.ok) return null;
  return res.json() as Promise<{
    id: string;
    name: string;
    slug: string;
    descriptionHtml?: string;
    specifications: Array<{ name: string; value: string }>;
    variants: Array<{
      id: number; sku?: string;
      images: { url: string; alt?: string }[];
      price?: { currencyCode: string; centAmount: number; discounted?: boolean; discountedCentAmount?: number; };
      attributes: Record<string, unknown>;
    }>;
    masterVariantId: number;
  }>;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await fetchProduct((await params).id);
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
    ? {
        currencyCode: master.price.currencyCode,
        centAmount: master.price.centAmount,
      }
    : undefined;
  const discounted = master?.price?.discountedCentAmount
    ? {
        currencyCode: master.price.currencyCode,
        centAmount: master.price.discountedCentAmount!,
      }
    : undefined;

  const gallery = master?.images?.length ? master.images : [{ url: '/placeholder.png', alt: 'Product' }];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-white dark:border-gray-800 dark:bg-gray-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery[0].url}
              alt={gallery[0].alt || product.name}
              className="h-full w-full object-contain p-4"
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.slice(1, 5).map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img.url}
                  alt={img.alt || `${product.name} thumbnail ${i + 2}`}
                  className="h-24 w-full rounded-xl border object-contain p-2 dark:border-gray-800"
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <div className="mt-3">{formatMoney(price, discounted)}</div>

          {/* Variant selector (client) when more than one variant */}
          {product.variants.length > 1 && (
            <div className="mt-6">
              <VariantPickerClient product={product} />
            </div>
          )}

          {/* Add to basket (client) */}
          <div className="mt-6">
            <AddToBasketClient product={product} />
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
