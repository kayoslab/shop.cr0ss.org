import { apiRootApp } from './client';
import type { Product, ProductVariant, Attribute } from '@commercetools/platform-sdk';
import type { ProductDTO, ProductVariantDTO, AttributeValue } from './dto/product';

type LString = Record<string, string>;
type EnumVal = { key: string; label: string | LString };

const DEFAULT_FALLBACKS = ['en-GB', 'de-DE'];

function ls(locale: string, ls?: Record<string, string>): string {
  if (!ls) return '';
  return ls[locale] ?? Object.values(ls)[0] ?? '';
}

// crude but practical; covers "en-GB", "de-DE", "en", etc.
function looksLikeLocaleKey(k: string) {
  return /^[a-z]{2}(-[A-Z]{2})?$/.test(k);
}

function isLocalizedStringObject(v: unknown): v is LString {
  if (!v || typeof v !== 'object') return false;
  const keys = Object.keys(v as Record<string, unknown>);
  if (keys.length === 0) return false;
  const localeish = keys.filter(looksLikeLocaleKey).length;
  return localeish >= Math.max(1, Math.floor(keys.length * 0.6));
}

function pickLocale<T extends Record<string, string>>(
  map: T,
  locale: string,
  fallbacks: string[] = DEFAULT_FALLBACKS
): string | undefined {
  if (map[locale]) return map[locale];
  for (const fb of fallbacks) if (map[fb]) return map[fb];
  const first = Object.values(map)[0];
  return first;
}

function isEnumVal(v: unknown): v is EnumVal {
  return !!v && typeof v === 'object' && 'key' in (v as any) && 'label' in (v as any);
}

function isMoney(v: any): v is { centAmount: number; currencyCode: string } {
  return v && typeof v === 'object' && typeof v.centAmount === 'number' && typeof v.currencyCode === 'string';
}

function formatMoney(v: { centAmount: number; currencyCode: string }) {
  return `${(v.centAmount / 100).toFixed(2)} ${v.currencyCode}`;
}

export function attrToValue(
  locale: string,
  attr?: Attribute,
  fallbacks: string[] = DEFAULT_FALLBACKS
): AttributeValue {
  if (!attr) return null;
  const v = attr.value as unknown;
  if (v == null) return null;

  if (isLocalizedStringObject(v)) {
    return pickLocale(v, locale, fallbacks) ?? '';
  }

  if (isEnumVal(v)) {
    if (typeof v.label === 'string') return v.label || v.key;
    // Localized enum label
    return pickLocale(v.label, locale, fallbacks) ?? v.key;
  }

  if (Array.isArray(v)) {
    const mapped = v.map((x) => {
      if (x == null) return '';
      if (typeof x === 'string' || typeof x === 'number' || typeof x === 'boolean') return x as any;
      if (isEnumVal(x)) {
        if (typeof x.label === 'string') return x.label || x.key;
        return pickLocale(x.label, locale, fallbacks) ?? x.key;
      }
      if (isLocalizedStringObject(x)) {
        return pickLocale(x, locale, fallbacks) ?? '';
      }
      if (isMoney(x)) return formatMoney(x);
      try { return JSON.stringify(x); } catch { return String(x); }
    });

    if (mapped.every((m) => typeof m === 'string')) return mapped as string[];
    if (mapped.every((m) => typeof m === 'number')) return mapped as number[];
    return mapped as unknown as string[];
  }

  if (isMoney(v)) {
    return formatMoney(v);
  }

  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
    return v as AttributeValue;
  }

  try { return JSON.stringify(v as Record<string, unknown>); } catch { return String(v); }
}

function variantToDTO(locale: string, variant: ProductVariant): ProductVariantDTO {
  const price = variant.prices?.[0];
  const discounted = price?.discounted?.value;
  const base = price?.value;
  const pv: ProductVariantDTO = {
    id: variant.id,
    sku: variant.sku || undefined,
    images: (variant.images ?? []).map((img, i) => ({
      url: img.url?.startsWith('//') ? `https:${img.url}` : img.url,
      alt: variant.sku ? `Image of ${variant.sku} #${i + 1}` : `Product image #${i + 1}`,
    })),
    price: base
      ? {
          currencyCode: base.currencyCode,
          centAmount: base.centAmount,
          discounted: !!discounted,
          discountedCentAmount: discounted?.centAmount,
        }
      : undefined,
    attributes: Object.fromEntries(
      (variant.attributes ?? []).map((a) => [a.name, attrToValue(locale, a)])
    ),
  };
  return pv;
}

export function mapProductToDTO(p: Product, locale: string): ProductDTO {
  const cur = p.masterData?.current;
  const master = cur?.masterVariant!;
  const variants = [master, ...(cur?.variants ?? [])];

  const descriptionHtml = cur?.description ? ls(cur.description as any) : undefined;
  const specs: Array<{ name: string; value: string }> = (master.attributes ?? [])
    .map((a) => {
      const val = attrToValue(locale, a);
      if (Array.isArray(val)) return { name: a.name, value: val.join(', ') };
      if (typeof val === 'object' && val !== null) return { name: a.name, value: JSON.stringify(val) };
      return { name: a.name, value: val == null ? '' : String(val) };
    })
    .filter((s) => s.value && s.value.length <= 200);

  return {
    id: p.id,
    name: cur?.name ? ls(cur.name as any) : '',
    slug: cur?.slug ? ls(cur.slug as any) : '',
    descriptionHtml,
    specifications: specs,
    variants: variants.map((v) => variantToDTO(locale, v)),
    masterVariantId: master.id,
  };
}

export async function searchProducts(limit = 12, locale = 'de-DE') {
  const res = await apiRootApp.productProjections().search().get({
    queryArgs: { limit, sort: ['name.' + locale + ' asc'] },
  }).execute();
  return res.body.results;
}

export async function searchProductBySlug(slug: string, locale='de-DE') {
  const res = await apiRootApp.productProjections().search().get({
    queryArgs: { filter: [`slug.${locale}:"${slug}"`], limit: 1 },
  }).execute();
  return res.body.results[0] || null;
}

export async function getProducts(
  { limit = 12, offset = 0 }: { limit?: number; offset?: number } = {}
) {
  const res = await apiRootApp.products().get({
    queryArgs: { limit, offset },
  }).execute();
  return res.body;
}

export async function getProductById(id: string) {
  const res = await apiRootApp.products().withId({ ID: id }).get().execute();
  return res.body;
}