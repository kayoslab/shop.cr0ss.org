import type { Product } from '@commercetools/platform-sdk';

export interface MoneyDTO {
  amount: number;
  currency: string;
}

export interface ProductDTO {
  id: string;
  version: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: MoneyDTO | null;
}

export function productToDTO(p: Product, locale: string): ProductDTO {
  const current = p.masterData?.current;
  const name =
    (current?.name as Record<string, string> | undefined)?.[locale] ??
    (current?.name as Record<string, string> | undefined)?.['en-GB'] ??
    '—';

  const slug =
    (current?.slug as Record<string, string> | undefined)?.[locale] ??
    (current?.slug as Record<string, string> | undefined)?.['en-GB'] ??
    p.id;

  const images = current?.masterVariant?.images ?? [];
  const prices = current?.masterVariant?.prices ?? [];
  const priceVal = prices[0]?.value;
  const imageUrl = images[0]?.url ?? null;

  return {
    id: p.id,
    version: p.version,
    name,
    slug,
    imageUrl,
    price: priceVal
      ? { amount: priceVal.centAmount, currency: priceVal.currencyCode }
      : null,
  };
}
