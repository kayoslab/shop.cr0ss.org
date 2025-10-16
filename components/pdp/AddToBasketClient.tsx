'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductProjectionDTO } from '@/lib/ct/dto/product';
import type { SupportedLocale } from '@/lib/i18n/locales';

export default function AddToBasketClient({
  product,
  locale,
  selectedVariantId,
}: {
  product: ProductProjectionDTO;
  locale: SupportedLocale;
  selectedVariantId?: number; // pass from VariantPickerClient via prop or context
}) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  const add = () => {
    const variantId =
      selectedVariantId ??
      product.variants.find((v) => v.id === product.masterVariantId)?.id ??
      product.variants[0]?.id;

    if (!variantId) {
      setErr('No variant selected');
      return;
    }

    startTransition(async () => {
      setErr(null);
      const res = await fetch(`/${locale}/api/cart/line-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // You can also send `sku` if you prefer: { sku: '...' }
        body: JSON.stringify({ productId: product.id, variantId, quantity: 1 }),
      });
      if (!res.ok) {
        setErr('Could not add to basket');
        return;
      }
      // Option: toast here. For now, refresh badges/summary if you add them later.
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={add}
        disabled={pending}
        className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60 dark:bg-white dark:text-black"
      >
        {pending ? 'Adding…' : 'Add to basket'}
      </button>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
