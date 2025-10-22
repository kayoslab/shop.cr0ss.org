import { unstable_cache as cache } from 'next/cache';
import type { Category, ProductProjectionPagedQueryResponse } from '@commercetools/platform-sdk';
import { appGetCategoryBySlug, appListProductsByCategoryId } from '@/lib/ct/categories';
import { mapProductProjectionToDTO } from '@/lib/ct/products';
import { fetchCategoryContentFromCMS } from '@/lib/contentful/category';
import type { ProductProjectionDTO } from '@/lib/ct/dto/product';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { localeToCountry, localeToCurrency } from '@/lib/i18n/locales';
import { CACHE_REVALIDATION } from '@/lib/config/cache';
import { categoryTags, cmsTags } from '@/lib/cache/tags';

/**
 * Category CMS Content DTO
 */
export interface CategoryCMSContentDTO {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  imageUrl?: string;
}

/**
 * PLP (Product Listing Page) Response
 */
export interface PLPResponse {
  categoryId: string;
  categorySlug: string;
  items: ProductProjectionDTO[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Fetch category PLP data (bypasses API route)
 * This directly fetches products for a category from commercetools
 */
async function _fetchPLPData(
  locale: SupportedLocale,
  slug: string,
  limit: number,
  offset: number
): Promise<PLPResponse | null> {
  const currency = localeToCurrency(locale);
  const country = localeToCountry(locale);

  // Try to find category by slug in current locale
  const category: Category | null = await appGetCategoryBySlug(slug, locale);

  if (!category) {
    return null;
  }

  // Fetch products for this category
  const data: ProductProjectionPagedQueryResponse = await appListProductsByCategoryId({
    categoryId: category.id,
    limit,
    offset,
  });

  const items = (data.results ?? []).map((p) =>
    mapProductProjectionToDTO(p, locale, { currency, country })
  );

  return {
    categoryId: category.id,
    categorySlug: slug,
    items,
    total: data.total ?? items.length,
    limit,
    offset,
  };
}

/**
 * Cached version of PLP data fetch
 */
export const fetchPLPData = (
  locale: SupportedLocale,
  slug: string,
  limit = 24,
  offset = 0
) =>
  cache(
    _fetchPLPData,
    ['plp-data', locale, slug, String(limit), String(offset)],
    {
      tags: [categoryTags.plp(slug, locale)],
      revalidate: CACHE_REVALIDATION.CATEGORY,
    }
  )(locale, slug, limit, offset);

/**
 * Fetch category CMS content (bypasses API route)
 * This directly fetches category content from Contentful
 */
async function _fetchCategoryCMSContent(
  locale: SupportedLocale,
  slug: string,
  preview: boolean
): Promise<CategoryCMSContentDTO | null> {
  return fetchCategoryContentFromCMS(slug, locale, preview);
}

/**
 * Cached version of category CMS content fetch
 */
export const fetchCategoryCMSContent = (
  locale: SupportedLocale,
  slug: string,
  preview = false
) =>
  cache(
    _fetchCategoryCMSContent,
    ['category-cms-content', locale, slug, String(preview)],
    {
      tags: [cmsTags.category(slug, locale)],
      revalidate: CACHE_REVALIDATION.HOME,
    }
  )(locale, slug, preview);

/**
 * Fetch all PLP data (products + CMS content) in one go
 * This is a convenience function that fetches both PLP and CMS data
 */
export async function fetchFullPLPData(
  locale: SupportedLocale,
  slug: string,
  searchParams: Record<string, string | string[] | undefined> = {}
): Promise<{
  plp: PLPResponse | null;
  cms: CategoryCMSContentDTO | null;
}> {
  const limit = typeof searchParams.limit === 'string' 
    ? Math.max(1, Math.min(50, Number(searchParams.limit)))
    : 24;
  const offset = typeof searchParams.offset === 'string'
    ? Math.max(0, Number(searchParams.offset))
    : 0;

  const [plp, cms] = await Promise.all([
    fetchPLPData(locale, slug, limit, offset),
    fetchCategoryCMSContent(locale, slug),
  ]);

  return { plp, cms };
}
