'use client';

import { useMemo, useState } from 'react';

type Product = {
  id: string;
  name: string;
  masterVariantId: number;
  variants: Array<{
    id: number;
    sku?: string;
    price?: { currencyCode: string; centAmount: number; discounted?: boolean; discountedCentAmount?: number; };
  }>;
};

type CartLine = {
  productId: string;
  variantId: number;
  qty: number;
  name: string;
  priceCentAmount?: number;
  currencyCode?: string;
};

const CART_KEY = 'demo_cart';

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeCart(lines: CartLine[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(lines));
  // fire a tiny event so a nav badge could update
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: lines.reduce((a, l) => a + l.qty, 0) } }));
}

export default function AddToBasketClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const master = useMemo(
    () => product.variants.find(v => v.id === product.masterVariantId) ?? product.variants[0],
    [product]
  );

  const handleAdd = () => {
    const cart = readCart();
    const idx = cart.findIndex(l => l.productId === product.id && l.variantId === master.id);
    const price = master.price?.discountedCentAmount ?? master.price?.centAmount;
    if (idx >= 0) {
      cart[idx].qty += qty;
    } else {
      cart.push({
        productId: product.id,
        variantId: master.id,
        qty,
        name: product.name,
        priceCentAmount: price,
        currencyCode: master.price?.currencyCode,
      });
    }
    writeCart(cart);
    // eslint-disable-next-line no-alert
    alert('Added to basket!');
    setQty(1);
  };

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
        className="w-20 rounded-lg border bg-white px-2 py-2 text-sm dark:border-gray-800 dark:bg-gray-950"
      />
      <button
        onClick={handleAdd}
        className="inline-flex items-center rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        Add to basket
      </button>
    </div>
  );
}
