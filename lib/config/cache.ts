/**
 * Centralized cache revalidation configuration
 *
 * These constants define how long cached data remains fresh before revalidation.
 *
 * ⚠️ IMPORTANT: Use these constants in API routes and unstable_cache calls.
 * DO NOT use them in page/layout segment config exports - Next.js requires
 * literal values there. Instead, use the literal value with a comment
 * referencing this file.
 *
 * @example
 * // ✅ API routes (GOOD):
 * cache(fn, ['key'], { revalidate: CACHE_REVALIDATION.HOME })
 *
 * // ❌ Page segment config (BAD - breaks build):
 * export const revalidate = CACHE_REVALIDATION.HOME;
 *
 * // ✅ Page segment config (GOOD):
 * // Cache revalidation: 5 minutes (see lib/config/cache.ts)
 * export const revalidate = 300;
 */

export const CACHE_REVALIDATION = {
  /** Home page cache duration (5 minutes) */
  HOME: 300,

  /** Product listing page cache duration (10 minutes) */
  CATEGORY: 600,

  /** Navigation/layout cache duration (1 hour) */
  LAYOUT: 3600,

  /** Product list API cache duration (5 minutes) */
  PRODUCTS: 300,

  /** Categories API cache duration (1 hour) */
  CATEGORIES: 3600,
} as const;

export type CacheRevalidation = typeof CACHE_REVALIDATION[keyof typeof CACHE_REVALIDATION];
