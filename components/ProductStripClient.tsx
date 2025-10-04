'use client';

import Link from 'next/link';
import { useRef } from 'react';
import type { ProductDTO } from '@/lib/ct/dto/product';

export default function ProductStrip({ items }: { items: ProductDTO[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scroller.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <button
        aria-label="Scroll left"
        onClick={() => scrollBy('left')}
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white/80 p-2 shadow hover:bg-white dark:border-gray-800 dark:bg-gray-900/80"
      >
        ◀
      </button>
      <div
        ref={scroller}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden"
    >

        {items.map((p) => (
            <div
                key={p.id}
                className="snap-start min-w-[220px] max-w-[260px] shrink-0 rounded-xl border bg-white p-4 dark:border-gray-800 dark:bg-gray-950"
            >

            <div className="font-medium line-clamp-2">{p.name}</div>
            {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="mt-2 h-48 w-full rounded-lg object-cover"
                    loading="lazy"
                />
                ) : (
                <div className="mt-2 h-48 w-full rounded-lg bg-gray-100 dark:bg-gray-900" />
            )}

            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {p.price ? `${(p.price.amount / 100).toFixed(2)} ${p.price.currency}` : '—'}
            </div>
            <Link href={`/products/${p.id}`} className="mt-3 inline-block text-blue-600 hover:underline">
              View
            </Link>
          </div>
        ))}
      </div>
      <button
        aria-label="Scroll right"
        onClick={() => scrollBy('right')}
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border bg-white/80 p-2 shadow hover:bg-white dark:border-gray-800 dark:bg-gray-900/80"
      >
        ▶
      </button>
    </div>
  );
}
