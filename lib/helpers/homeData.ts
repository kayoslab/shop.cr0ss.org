import { unstable_cache as cache } from 'next/cache';
import type { Category } from '@commercetools/platform-sdk';
import { fetchHomeFromCMS } from '@/lib/contentful/home';
import { fetchCategoryContentFromCMS } from '@/lib/contentful/category';
import { appListCategories, buildCategoryTree } from '@/lib/ct/categories';
import { getProductProjections, mapProductProjectionToDTO } from '@/lib/ct/products';
import type { HomeDTO } from '@/lib/contentful/dto/home';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import type { ProductDTO } from '@/lib/ct/dto/product';
import type { CategoryCMSContentDTO } from '@/app/[locale]/api/cms/categories/[slug]/route';
import { SupportedLocale, localeToCountry, localeToCurrency } from '@/lib/i18n/locales';
import { CACHE_REVALIDATION } from '@/lib/config/cache';
import { cmsTags, categoryTags, productTags } from '@/lib/cache/tags';

/**
 * Fetch home page data from CMS (bypasses API route)
 */
async function _fetchHomeData(locale: SupportedLocale, preview: boolean): Promise<HomeDTO | null> {
  return fetchHomeFromCMS(locale, preview);
}

export const fetchHomeData = (locale: SupportedLocale, preview = false) =>
  cache(_fetchHomeData, ['home-data', locale, String(preview)], {
    tags: [cmsTags.home(locale)],
    revalidate: CACHE_REVALIDATION.HOME,
  })(locale, preview);

/**
 * Fetch category content from CMS (bypasses API route)
 */
async function _fetchCategoryContent(
  locale: SupportedLocale,
  slug: string,
  preview: boolean
): Promise<CategoryCMSContentDTO | null> {
  return fetchCategoryContentFromCMS(slug, locale, preview);
}

export const fetchCategoryContent = (locale: SupportedLocale, slug: string, preview = false) =>
  cache(_fetchCategoryContent, ['category-content', locale, slug, String(preview)], {
    tags: [cmsTags.category(slug, locale)],
    revalidate: CACHE_REVALIDATION.HOME,
  })(locale, slug, preview);

/**
 * Helper to flatten categories recursively
 */
function flattenCategories(categories?: CategoryDTO[] | null): CategoryDTO[] {
  if (!Array.isArray(categories)) return [];
  const out: CategoryDTO[] = [];
  for (const raw of categories) {
    const node: CategoryDTO = {
      ...raw,
      children: Array.isArray(raw?.children) ? raw.children : [],
    };
    out.push(node);
    if (node.children.length) {
      out.push(...flattenCategories(node.children));
    }
  }
  return out;
}

/**
 * Fetch categories with optional CMS enrichment (bypasses API route)
 */
async function _fetchCategoriesData(
  locale: SupportedLocale,
  featuredSlugs?: string[],
  sliced = 8
): Promise<CategoryDTO[]> {
  const categories: Category[] = await appListCategories(200);
  const tree = buildCategoryTree(categories, locale);
  
  const flat = flattenCategories(tree);
  const chosen = featuredSlugs?.length
    ? flat.filter((c) => featuredSlugs.includes(c.slug))
    : flat.slice(0, Math.max(1, sliced));

  // Enrich in parallel
  const enriched = await Promise.all(
    chosen.map(async (c) => {
      try {
        const content = await fetchCategoryContent(locale, c.slug);
        return content ? { ...c, content } : c;
      } catch {
        return c;
      }
    })
  );
  
  return enriched;
}

export const fetchCategoriesData = (
  locale: SupportedLocale,
  featuredSlugs?: string[],
  sliced = 8
) =>
  cache(_fetchCategoriesData, ['categories-data', locale, JSON.stringify(featuredSlugs), String(sliced)], {
    tags: [categoryTags.all(locale)],
    revalidate: CACHE_REVALIDATION.CATEGORIES,
  })(locale, featuredSlugs, sliced);

/**
 * Fetch recommended products (bypasses API route)
 */
async function _fetchRecommendedProducts(
  locale: SupportedLocale,
  limit = 4
): Promise<ProductDTO[]> {
  const currency = localeToCurrency(locale);
  const country = localeToCountry(locale);
  
  const data = await getProductProjections(
    { limit, offset: 0 },
    { currency, country },
    locale
  );

  return (data.results ?? []).map((p) =>
    mapProductProjectionToDTO(p, locale, { currency, country })
  );
}

export const fetchRecommendedProducts = (locale: SupportedLocale, limit = 4) =>
  cache(_fetchRecommendedProducts, ['recommended-products', locale, String(limit)], {
    tags: [productTags.all(locale)],
    revalidate: CACHE_REVALIDATION.PRODUCTS,
  })(locale, limit);
