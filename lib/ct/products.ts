import { apiRootApp } from './client';
import type {
  Attribute,
  LocalizedString,
  Money,
  Product,
  ProductVariant,
} from '@commercetools/platform-sdk';
import type {
  AttributeValue,
  ProductDTO,
  ProductVariantDTO,
} from './dto/product';

// -----------------------------
// Helpers & Type Guards
// -----------------------------

type LString = Record<string, string>;
type EnumVal = { key: string; label: string | LString };

const DEFAULT_FALLBACKS = ['en-GB', 'de-DE'] as const;

function ls(locale: string, ls?: LocalizedString): string {
  if (!ls) return '';
  return ls[locale] ?? Object.values(ls)[0] ?? '';
}

// crude but practical; covers "en-GB", "de-DE", "en", etc.
function looksLikeLocaleKey(k: string): boolean {
  return /^[a-z]{2}(-[A-Z]{2})?$/.test(k);
}

function isLocalizedStringObject(v: unknown): v is LString {
  if (!v || typeof v !== 'object') return false;
  const rec = v as Record<string, unknown>;
  const keys = Object.keys(rec);
  if (keys.length === 0) return false;
  const localeish = keys.filter(looksLikeLocaleKey).length;
  return localeish >= Math.max(1, Math.floor(keys.length * 0.6));
}

function pickLocale<T extends Record<string, string>>(
  map: T,
  locale: string,
  fallbacks: readonly string[] = DEFAULT_FALLBACKS
): string | undefined {
  if (map[locale]) return map[locale];
  for (const fb of fallbacks) if (map[fb]) return map[fb];
  const first = Object.values(map)[0];
  return first;
}

function isEnumVal(v: unknown): v is EnumVal {
  if (!v || typeof v !== 'object') return false;
  const rec = v as Record<string, unknown>;
  return 'key' in rec && 'label' in rec && typeof rec.key === 'string';
}

function isMoney(v: unknown): v is Money {
  if (!v || typeof v !== 'object') return false;
  const rec = v as Record<string, unknown>;
  return (
    typeof (rec as Partial<Money>).centAmount === 'number' &&
    typeof (rec as Partial<Money>).currencyCode === 'string'
  );
}

function formatMoney(v: Money): string {
  return `${(v.centAmount / 100).toFixed(2)} ${v.currencyCode}`;
}

// -----------------------------
// Attribute → Value
// -----------------------------

export function attrToValue(
  locale: string,
  attr?: Attribute,
  fallbacks: readonly string[] = DEFAULT_FALLBACKS
): AttributeValue {
  if (!attr) return null;

  const v: unknown = attr.value;
  if (v == null) return null;

  // LocalizedString (value is entire locale map)
  if (isLocalizedStringObject(v)) {
    return pickLocale(v, locale, fallbacks) ?? '';
  }

  // Enum / LocalizedEnum
  if (isEnumVal(v)) {
    const label = v.label;
    if (typeof label === 'string') return label || v.key;
    return pickLocale(label, locale, fallbacks) ?? v.key;
  }

  // Sets (arrays)
  if (Array.isArray(v)) {
    const mapped = v.map((x): string | number | boolean | Record<string, unknown> => {
      if (x == null) return '';
      if (typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean') return x;

      if (isEnumVal(x)) {
        const label = x.label;
        if (typeof label === 'string') return label || x.key;
        return pickLocale(label, locale, fallbacks) ?? x.key;
      }

      if (isLocalizedStringObject(x)) {
        return pickLocale(x, locale, fallbacks) ?? '';
      }

      if (isMoney(x)) return formatMoney(x);

      // last resort: preserve object as a string
      try {
        return JSON.stringify(x as Record<string, unknown>);
      } catch {
        return String(x);
      }
    });

    if (mapped.every((m) => typeof m === 'string')) return mapped as string[];
    if (mapped.every((m) => typeof m === 'number')) return mapped as number[];
    // mixed → stringify for consistency
    return mapped.map((m) => (typeof m === 'string' ? m : String(m)));
  }

  // Money
  if (isMoney(v)) return formatMoney(v);

  // Primitives
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return v as AttributeValue;
  }

  // Unknown object: stringify safely
  try {
    return JSON.stringify(v as Record<string, unknown>);
  } catch {
    return String(v);
  }
}

// -----------------------------
// Variant / Product mapping
// -----------------------------

function variantToDTO(locale: string, variant: ProductVariant): ProductVariantDTO {
  const price = variant.prices?.[0];
  const discounted = price?.discounted?.value;
  const base = price?.value;

  const images = (variant.images ?? []).map((img, i) => ({
    url: img.url?.startsWith('//') ? `https:${img.url}` : img.url,
    alt: variant.sku ? `Image of ${variant.sku} #${i + 1}` : `Product image #${i + 1}`,
  }));

  const attributes =
    Object.fromEntries(
      (variant.attributes ?? []).map((a) => [a.name, attrToValue(locale, a)])
    ) as Record<string, AttributeValue>;

  return {
    id: variant.id,
    sku: variant.sku || undefined,
    images,
    price: base
      ? {
          currencyCode: base.currencyCode,
          centAmount: base.centAmount,
          discounted: Boolean(discounted),
          discountedCentAmount: discounted?.centAmount,
        }
      : undefined,
    attributes,
  };
}

export function mapProductToDTO(p: Product, locale: string): ProductDTO {
  const cur = p.masterData?.current;
  const master = cur?.masterVariant;
  const variantsList: ProductVariant[] = master
    ? [master, ...(cur?.variants ?? [])]
    : cur?.variants ?? [];

  const descriptionHtml = cur?.description ? ls(locale, cur.description) : undefined;

  const specs: Array<{ name: string; value: string }> = (master?.attributes ?? [])
    .map((a) => {
      const val = attrToValue(locale, a);
      if (Array.isArray(val)) return { name: a.name, value: val.join(', ') };
      if (typeof val === 'object' && val !== null) return { name: a.name, value: JSON.stringify(val) };
      return { name: a.name, value: val == null ? '' : String(val) };
    })
    .filter((s) => s.value && s.value.length <= 200);

  return {
    id: p.id,
    name: cur?.name ? ls(locale, cur.name) : '',
    slug: cur?.slug ? ls(locale, cur.slug) : '',
    descriptionHtml,
    specifications: specs,
    variants: variantsList.map((v) => variantToDTO(locale, v)),
    masterVariantId: master?.id ?? 1, // fallback to 1 if absent (rare)
  };
}

// -----------------------------
// API calls
// -----------------------------

export async function searchProducts(limit = 12, locale = 'de-DE') {
  const res = await apiRootApp
    .productProjections()
    .search()
    .get({
      queryArgs: { limit, sort: [`name.${locale} asc`] },
    })
    .execute();
  return res.body.results;
}

export async function searchProductBySlug(slug: string, locale = 'de-DE') {
  const res = await apiRootApp
    .productProjections()
    .search()
    .get({
      queryArgs: { filter: [`slug.${locale}:"${slug}"`], limit: 1 },
    })
    .execute();
  return res.body.results[0] || null;
}

export async function getProducts(params: { limit?: number; offset?: number } = {}) {
  const { limit = 12, offset = 0 } = params;
  const res = await apiRootApp
    .products()
    .get({
      queryArgs: { limit, offset },
    })
    .execute();
  return res.body;
}

export async function getProductById(id: string) {
  const res = await apiRootApp.products().withId({ ID: id }).get().execute();
  return res.body;
}