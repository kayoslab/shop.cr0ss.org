'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { SupportedLocale } from '@/lib/i18n/locales';

export default function CartClient({
  locale,
  lineItemId,
  quantity,
}: {
  locale: SupportedLocale;
  lineItemId: string;
  quantity: number;
}) {
  const [qty, setQty] = useState<number>(quantity);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const setQuantity = (next: number) => {
    startTransition(async () => {
      const res = await fetch(`/${locale}/api/cart/line-items/${lineItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: next }),
      });
      if (res.ok) {
        setQty(next);
        router.refresh(); // refresh the server page
      }
    });
  };

  const remove = () => setQuantity(0);

  return (
    <div className="flex items-center gap-2">
      <button
        className="rounded-lg border px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-800"
        onClick={() => setQuantity(Math.max(0, qty - 1))}
        disabled={pending || qty === 0}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-8 text-center tabular-nums">{qty}</span>
      <button
        className="rounded-lg border px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-800"
        onClick={() => setQuantity(qty + 1)}
        disabled={pending}
        aria-label="Increase quantity"
      >
        +
      </button>
      <button
        className="ml-2 rounded-lg border px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-800"
        onClick={remove}
        disabled={pending}
        aria-label="Remove item"
      >
        Remove
      </button>
    </div>
  );
}
