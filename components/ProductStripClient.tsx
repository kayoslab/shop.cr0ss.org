'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { type ProductDTO } from '@/lib/ct/dto/product';

function formatPrice(p?: {
  currencyCode: string;
  centAmount: number;
  discounted?: boolean;
  discountedCentAmount?: number;
}) {
  if (!p) return '—';
  const base = (p.centAmount / 100).toFixed(2);
  if (p.discounted && p.discountedCentAmount && p.discountedCentAmount < p.centAmount) {
    const disc = (p.discountedCentAmount / 100).toFixed(2);
    return (
      <div className="flex items-baseline gap-2">
        <span className="font-semibold">
          {disc} {p.currencyCode}
        </span>
        <span className="text-xs text-gray-500 line-through">
          {base} {p.currencyCode}
        </span>
      </div>
    );
  }
  return `${base} ${p.currencyCode}`;
}

function getPrimaryImage(p: ProductDTO): { url: string; alt: string } | null {
  // Oversimplified by picking the first image of the first variant as the primary image.
  const v = p.variants?.[0];
  const img = v?.images?.[0];
  if (!img?.url) return null;
  const url = img.url.startsWith('//') ? `https:${img.url}` : img.url;
  return { url, alt: p.name };
}

export default function ProductStrip({ items }: { items: ProductDTO[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const recalcArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scrollBy = (dir: 'left' | 'right') => {
    const el = scroller.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  useEffect(() => {
    recalcArrows();
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => recalcArrows();
    el.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onScroll);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="relative">
      {/* Scroll hints */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent dark:from-gray-950" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-950" />

      {/* Arrows */}
      <button
        aria-label="Scroll left"
        onClick={() => scrollBy('left')}
        disabled={!canLeft}
        className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full border bg-white/80 p-2 shadow hover:bg-white disabled:opacity-40 dark:border-gray-800 dark:bg-gray-900/80"
      >
        ◀
      </button>
      <button
        aria-label="Scroll right"
        onClick={() => scrollBy('right')}
        disabled={!canRight}
        className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full border bg-white/80 p-2 shadow hover:bg-white disabled:opacity-40 dark:border-gray-800 dark:bg-gray-900/80"
      >
        ▶
      </button>

      {/* Track */}
      <div
        ref={scroller}
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-2"
      >
        {items.map((p) => {
          const img = getPrimaryImage(p);
          return (
            <div
              key={p.id}
              className="snap-start min-w-[220px] max-w-[260px] shrink-0 rounded-xl border bg-white p-3 dark:border-gray-800 dark:bg-gray-950"
            >
              <Link href={`/products/${p.id}`} className="block">
                {/* Image wrapper with inner padded layer; object-contain prevents cropping */}
                <div className="relative mb-2 aspect-[4/5] w-full overflow-hidden rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-900">
                  <div className="absolute inset-0 p-3">
                    {img && (
                      <Image
                        src={img.url}
                        alt={img.alt}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 50vw, 240px"
                        priority={false}
                      />
                    )}
                  </div>
                </div>

                <div className="line-clamp-2 min-h-[2.5rem] text-sm font-medium">{p.name}</div>
              </Link>

              <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                {formatPrice(p.variants?.[0]?.price)}
              </div>

              <Link
                href={`/products/${p.id}`}
                className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                View
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
