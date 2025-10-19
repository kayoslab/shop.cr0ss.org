/**
 * Centralized placeholder image constants
 *
 * Used across the application for fallback images when actual content is unavailable.
 */

export const PLACEHOLDER_IMAGES = {
  /** Product placeholder image */
  PRODUCT: '/placeholder.png',

  /** Category placeholder with dimensions hint */
  CATEGORY: '/placeholder.svg?height=200&width=400',

  /** Generic placeholder */
  GENERIC: '/placeholder.png',
} as const;

/**
 * Type representing available placeholder images
 */
export type PlaceholderImage = typeof PLACEHOLDER_IMAGES[keyof typeof PLACEHOLDER_IMAGES];
