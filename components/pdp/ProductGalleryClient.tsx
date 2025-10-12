'use client';

import { useEffect, useState, useCallback } from 'react';

type Img = { url: string; alt?: string };

export default function ProductGalleryClient({
  images,
  productName,
}: {
  images: Img[];
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openAt = useCallback((i: number) => {
    setIndex(i);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, images.length, close]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const main = images[0];
  const thumbs = images.slice(1, 5);

  return (
    <>
      {/* Main image */}
      <button
        type="button"
        aria-label="Open image preview"
        className="group relative aspect-square w-full overflow-hidden rounded-2xl border bg-white dark:border-gray-800 dark:bg-gray-950"
        onClick={() => openAt(0)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={main.url}
          alt={main.alt || productName}
          className="h-full w-full object-contain p-4 transition-transform duration-200 group-hover:scale-[1.02]"
        />
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-1 text-xs text-white">
          Tap to zoom
        </span>
      </button>

      {/* Thumbnails */}
      {thumbs.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {thumbs.map((img, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Open image ${i + 2} preview`}
              onClick={() => openAt(i + 1)}
              className="relative h-24 w-full overflow-hidden rounded-xl border bg-white dark:border-gray-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || `${productName} thumbnail ${i + 2}`}
                className="h-full w-full object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox / Overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={close}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              aria-label="Close image preview"
              onClick={close}
              className="absolute -top-2 -right-2 z-10 rounded-full bg-white p-2 shadow md:-top-3 md:-right-3"
            >
              {/* X icon */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="currentColor"
                  d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.42L12 13.41l4.89 4.9a1 1 0 0 0 1.42-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4Z"
                />
              </svg>
            </button>

            {/* Prev / Next (visible on md+, still tappable on mobile by swiping keys) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-md bg-white/80 px-3 py-2 shadow hover:bg-white hidden md:block"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => setIndex((i) => (i + 1) % images.length)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-md bg-white/80 px-3 py-2 shadow hover:bg-white hidden md:block"
                >
                  ›
                </button>
              </>
            )}

            {/* Image */}
            <div className="flex max-h-[85vh] items-center justify-center rounded-xl bg-white p-2 shadow dark:bg-gray-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[index].url}
                alt={images[index].alt || productName}
                className="max-h-[80vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Counter */}
            {images.length > 1 && (
              <div className="mt-2 text-center text-xs text-white/80">{index + 1} / {images.length}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
