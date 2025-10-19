/**
 * Standardized API error handling utilities
 */

import { NextResponse } from 'next/server';
import type { APIErrorResponse } from '@/lib/types/api';

/**
 * Standard HTTP error status codes
 */
export const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Creates a standardized JSON error response
 */
export function createErrorResponse(
  error: string,
  statusCode: number,
  message?: string
): NextResponse<APIErrorResponse> {
  return NextResponse.json(
    {
      error,
      statusCode,
      ...(message && { message }),
    },
    { status: statusCode }
  );
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  localeNotSupported: () =>
    createErrorResponse(
      'Locale not supported',
      HTTP_STATUS.BAD_REQUEST,
      'The requested locale is not supported'
    ),

  notFound: (resource = 'Resource') =>
    createErrorResponse(
      'Not found',
      HTTP_STATUS.NOT_FOUND,
      `${resource} not found`
    ),

  badRequest: (message?: string) =>
    createErrorResponse(
      'Bad request',
      HTTP_STATUS.BAD_REQUEST,
      message
    ),

  unauthorized: () =>
    createErrorResponse(
      'Unauthorized',
      HTTP_STATUS.UNAUTHORIZED,
      'Authentication required'
    ),

  forbidden: () =>
    createErrorResponse(
      'Forbidden',
      HTTP_STATUS.FORBIDDEN,
      'You do not have permission to access this resource'
    ),

  methodNotAllowed: () =>
    createErrorResponse(
      'Method not allowed',
      HTTP_STATUS.METHOD_NOT_ALLOWED,
      'HTTP method not allowed for this endpoint'
    ),

  internalServerError: (message = 'An unexpected error occurred') =>
    createErrorResponse(
      'Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message
    ),

  serviceUnavailable: () =>
    createErrorResponse(
      'Service unavailable',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      'The service is temporarily unavailable'
    ),
};

/**
 * Error handler wrapper for API routes
 * Catches errors and returns standardized error responses
 */
export function withErrorHandler<T>(
  handler: () => Promise<T>
): Promise<T | NextResponse<APIErrorResponse>> {
  return handler().catch((error: unknown) => {
    console.error('API Error:', error);

    if (error instanceof Error) {
      return ErrorResponses.internalServerError(error.message);
    }

    return ErrorResponses.internalServerError();
  });
}
