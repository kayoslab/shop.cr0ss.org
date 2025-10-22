'use client';

import { useEffect, useState, useCallback } from 'react';
import type { SupportedLocale } from '@/lib/i18n/locales';

export default function CartCountClient({ locale }: { locale: SupportedLocale }) {
  const [count, setCount] = useState<number>(0);

  const load = useCallback(async () => {
    try {
      
      const res = await fetch(`/${locale}/api/cart`, {
        cache: 'no-store',
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      const items = Array.isArray(data?.lineItems) ? data.lineItems : [];
      const totalQty = items.reduce((acc: number, li: { quantity: number }) => acc + (Number(li?.quantity) || 0), 0);
      setCount(totalQty);
    } catch {
      // ignore network errors for the badge
    }
  }, [locale]);

  useEffect(() => {
    load();

    const onUpdate = () => load();
    // update on add/remove/qty changes
    window.addEventListener('cart-updated', onUpdate);
    // refresh on tab focus (helps across navigations)
    window.addEventListener('focus', onUpdate);

    return () => {
      window.removeEventListener('cart-updated', onUpdate);
      window.removeEventListener('focus', onUpdate);
    };
  }, [load]);

  // Show 0 by default to avoid server/client mismatch
  return (
    <span
      className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-gray-900 px-1 text-xs font-medium text-white dark:bg-gray-100 dark:text-gray-900"
      aria-label="Cart item count"
    >
      {count}
    </span>
  );
}
