export function toDTO(p: any, locale: string) {
  const current = p?.masterData?.current;
  const name = current?.name?.[locale] ?? current?.name?.['en-GB'] ?? '—';
  const slug = current?.slug?.[locale] ?? current?.slug?.['en-GB'] ?? p?.id;
  const images = current?.masterVariant?.images ?? [];
  const prices = current?.masterVariant?.prices ?? [];
  const price = prices[0]?.value;
  const imageUrl = images[0]?.url ?? null;

  return {
    id: p.id,
    version: p.version,
    name,
    slug,
    imageUrl,
    price: price ? { amount: price.centAmount, currency: price.currencyCode } : null,
  };
}
