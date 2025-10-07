'use client';

import { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  masterVariantId: number;
  variants: Array<{
    id: number;
    sku?: string;
    images: { url: string; alt?: string }[];
    price?: { currencyCode: string; centAmount: number; discounted?: boolean; discountedCentAmount?: number; };
    attributes: Record<string, unknown>;
  }>;
};

function variantLabel(v: Product['variants'][number]) {
  const sku = v.sku ? `SKU ${v.sku}` : `Variant ${v.id}`;
  // Try to compose a short attribute summary from common keys
  const keys = Object.keys(v.attributes || {});
  const interesting = keys.filter((k) =>
    ['size', 'color', 'colour', 'material', 'length'].includes(k.toLowerCase())
  );
  const summary = interesting
    .map((k) => {
      const val = v.attributes?.[k];
      if (Array.isArray(val)) return `${k}: ${(val as string[]).join('/')}`;
      return `${k}: ${String(val)}`;
    })
    .join(', ');
  return summary ? `${sku} — ${summary}` : sku;
}

export default function VariantPickerClient({ product }: { product: Product }) {
  const [selectedId, setSelectedId] = useState<number>(product.masterVariantId);
  const variants = product.variants;

  useEffect(() => {}, [selectedId]);

  return (
    <div className="space-y-2">
      <label htmlFor="variant" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Select variant
      </label>
      <select
        id="variant"
        className="w-full rounded-lg border bg-white px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
        value={selectedId}
        onChange={(e) => setSelectedId(Number(e.target.value))}
      >
        {variants.map((v) => (
          <option key={v.id} value={v.id}>
            {variantLabel(v)}
          </option>
        ))}
      </select>
      <p className="text-xs text-gray-500">
        Showing price/images are for the master variant on initial load. (For a production app, you’d
        wire this selection to update price/gallery client-side or via a shallow route.)
      </p>
    </div>
  );
}
