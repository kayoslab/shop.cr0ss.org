/**
 * Centralized cache tag generation for consistent cache invalidation
 * across the application.
 *
 * All cache tags follow the pattern: `resource:identifier:locale`
 * This ensures proper invalidation granularity and multi-locale support.
 */

import type { SupportedLocale } from '@/lib/i18n/locales';

/**
 * Cache tags for product-related data
 */
export const productTags = {
  /**
   * Tag for all products in a locale
   * Used by: product list API, home page
   */
  all: (locale: SupportedLocale) => `products:${locale}` as const,

  /**
   * Tag for a specific product
   * Used by: product detail page, product API
   */
  byId: (id: string, locale: SupportedLocale) => `product:${id}:${locale}` as const,
};

/**
 * Cache tags for category-related data
 */
export const categoryTags = {
  /**
   * Tag for all categories in a locale
   * Used by: category list API, navigation
   */
  all: (locale: SupportedLocale) => `categories:${locale}` as const,

  /**
   * Tag for a specific category's product listing page
   * Used by: PLP API, category pages
   */
  plp: (slug: string, locale: SupportedLocale) => `plp:cat:${slug}:${locale}` as const,

  /**
   * Tag for a specific category
   * Used by: category detail
   */
  bySlug: (slug: string, locale: SupportedLocale) => `category:${slug}:${locale}` as const,
};

/**
 * Cache tags for CMS content
 */
export const cmsTags = {
  /**
   * Tag for homepage content
   * Used by: home page, home API
   */
  home: (locale: SupportedLocale) => `cms:home:${locale}` as const,

  /**
   * Tag for category CMS content
   * Used by: category pages, category CMS API
   */
  category: (slug: string, locale: SupportedLocale) => `cms:categories:${slug}:${locale}` as const,
};

/**
 * Utility to get all cache tags that should be revalidated when a product changes
 */
export function getProductRevalidationTags(productId: string, locale: SupportedLocale): string[] {
  return [
    productTags.all(locale),
    productTags.byId(productId, locale),
  ];
}

/**
 * Utility to get all cache tags that should be revalidated when a category changes
 */
export function getCategoryRevalidationTags(slug: string, locale: SupportedLocale): string[] {
  return [
    categoryTags.all(locale),
    categoryTags.bySlug(slug, locale),
    categoryTags.plp(slug, locale),
  ];
}

/**
 * Utility to get all cache tags that should be revalidated when CMS content changes
 */
export function getCMSRevalidationTags(contentType: 'home' | 'category', slug: string | null, locale: SupportedLocale): string[] {
  if (contentType === 'home') {
    return [cmsTags.home(locale)];
  }
  if (slug) {
    return [cmsTags.category(slug, locale)];
  }
  return [];
}
