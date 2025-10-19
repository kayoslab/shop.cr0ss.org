/**
 * Shared API response types for consistent API contracts across the application
 */

import type { ProductProjectionDTO } from '@/lib/ct/dto/product';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import type { CartDTO } from '@/lib/ct/dto/cart';
import type { HomeDTO } from '@/lib/contentful/dto/home';

/**
 * Standard API error response
 */
export interface APIErrorResponse {
  error: string;
  message?: string;
  statusCode: number;
  digest?: string;
}

/**
 * Paginated list response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Product list API response
 */
export type ProductListResponse = PaginatedResponse<ProductProjectionDTO>;

/**
 * Category product listing page (PLP) response
 */
export interface CategoryPLPResponse extends PaginatedResponse<ProductProjectionDTO> {
  categoryId: string;
  categorySlug: string;
}

/**
 * Category list API response
 */
export type CategoryListResponse = CategoryDTO[];

/**
 * Single product API response
 */
export type ProductResponse = ProductProjectionDTO;

/**
 * Cart API response
 */
export type CartResponse = CartDTO;

/**
 * CMS Home API response
 */
export type CMSHomeResponse = HomeDTO;

/**
 * Type guard to check if a response is an error
 */
export function isAPIError(response: unknown): response is APIErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    'statusCode' in response
  );
}

/**
 * Helper to create standardized error responses
 */
export function createErrorResponse(
  error: string,
  statusCode: number,
  message?: string,
  digest?: string
): APIErrorResponse {
  return {
    error,
    statusCode,
    ...(message && { message }),
    ...(digest && { digest }),
  };
}
