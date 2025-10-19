/**
 * TypeScript types for Contentful content models
 *
 * These types provide type safety for Contentful field access.
 * In a production app, consider using Contentful's type generation:
 * https://www.contentful.com/developers/docs/references/content-management-api/#/reference/content-types
 */

import type { Asset, Entry, EntrySkeletonType } from 'contentful';

/**
 * Homepage content type skeleton
 */
export interface HomepageSkeleton extends EntrySkeletonType {
  contentTypeId: 'homepage';
  fields: {
    internalName?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroCtaText?: string;
    heroCtaLink?: string;
    heroImage?: Asset;
    featuredCategorySlugs?: string[];
    recommendedHeading?: string;
    showcaseHeading?: string;
  };
}

export type HomepageEntry = Entry<HomepageSkeleton>;

/**
 * Category CMS content type skeleton
 */
export interface CategoryCMSSkeleton extends EntrySkeletonType {
  contentTypeId: 'categoryContent';
  fields: {
    title?: string;
    slug?: string;
    excerpt?: string;
    description?: string;
    image?: Asset;
  };
}

export type CategoryCMSEntry = Entry<CategoryCMSSkeleton>;

/**
 * Content type IDs (should match Contentful space)
 */
export const CONTENT_TYPE_IDS = {
  HOMEPAGE: 'homepage',
  CATEGORY: 'categoryContent',
} as const;

/**
 * Type guard to check if entry is Homepage
 */
export function isHomepageEntry(entry: Entry<EntrySkeletonType>): entry is HomepageEntry {
  return entry.sys.contentType.sys.id === CONTENT_TYPE_IDS.HOMEPAGE;
}

/**
 * Type guard to check if entry is Category CMS
 */
export function isCategoryCMSEntry(entry: Entry<EntrySkeletonType>): entry is CategoryCMSEntry {
  return entry.sys.contentType.sys.id === CONTENT_TYPE_IDS.CATEGORY;
}

/**
 * Helper to safely extract asset URL
 */
export function getAssetUrl(asset: Asset | undefined, locale: string, fallbackLocale = 'en-GB'): string | undefined {
  if (!asset?.fields?.file) return undefined;

  const file = asset.fields.file;

  // Handle direct URL (non-localized)
  if (typeof file === 'object' && file && 'url' in file && typeof file.url === 'string') {
    const url = file.url;
    return url.startsWith('//') ? `https:${url}` : url;
  }

  // Handle localized fields (file is a locale map)
  if (typeof file === 'object' && file) {
    const localeMap = file as Record<string, unknown>;
    const localeFile = localeMap[locale] || localeMap[fallbackLocale];
    if (localeFile && typeof localeFile === 'object' && localeFile !== null && 'url' in localeFile) {
      const url = (localeFile as { url: string }).url;
      return url.startsWith('//') ? `https:${url}` : url;
    }
  }

  return undefined;
}
