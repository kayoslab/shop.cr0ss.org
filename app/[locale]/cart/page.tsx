// app/[locale]/cart/page.tsx
export const runtime = 'edge';
export const revalidate = 0;

import type { SupportedLocale } from '@/lib/i18n/locales';
import type { CartDTO } from '@/lib/ct/dto/cart';
import CartClient from '@/components/cart/CartClient';
import { absoluteBase } from '@/lib/networking/absoluteBase';
import { headers } from 'next/headers';
import Link from 'next/link';
import { formatCentAmount, formatCartPrice } from '@/lib/utils/formatPrice';

async function fetchCart(locale: SupportedLocale): Promise<CartDTO | null> {
  const base = absoluteBase();
  const h = headers();
  const cookie = (await h).get('cookie') ?? '';
  const res = await fetch(`${base}/${locale}/api/cart`, {
    cache: 'no-store',
    headers: { cookie },
  });
  if (!res.ok) return null;
  return (await res.json()) as CartDTO;
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: SupportedLocale }>;
}) {
  const { locale } = await params;
  const cart = await fetchCart(locale);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Your Cart</h1>

      {!cart || cart.lineItems.length === 0 ? (
        <p className="text-gray-600">Your cart is empty.</p>
      ) : (
        <>
          <ul className="divide-y rounded-2xl border dark:border-gray-800">
            {cart.lineItems.map((li) => (
              <li key={li.id} className="flex items-center gap-4 p-4">
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={li.imageUrl || '/placeholder.png'}
                  alt={li.name}
                  className="h-16 w-16 rounded-lg border object-contain p-1 dark:border-gray-800"
                />

                {/* Title/SKU */}
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">
                    <Link
                      href={`/${locale}/products/${li.productId}`}
                      className="hover:underline"
                    >
                      {li.name}
                    </Link>
                  </div>
                  <div className="text-sm text-gray-500">
                    {li.sku ? `SKU: ${li.sku}` : null}
                  </div>
                </div>

                {/* Unit price with strike-through old price when discounted */}
                <div className="min-w-[7rem] text-right">
                  {formatCartPrice(li.unitPrice)}
                </div>

                {/* Quantity controls */}
                <CartClient locale={locale} lineItemId={li.id} quantity={li.quantity} />
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-end gap-6">
            <div className="text-right">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-xl font-semibold">
                {cart.total
                  ? formatCentAmount(cart.total.centAmount, cart.total.currencyCode)
                  : '-'}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
