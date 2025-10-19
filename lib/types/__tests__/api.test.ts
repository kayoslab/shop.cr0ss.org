import { describe, it, expect } from 'vitest';
import { isAPIError, createErrorResponse } from '../api';
import type { APIErrorResponse } from '../api';

describe('isAPIError type guard', () => {
  it('returns true for valid error responses', () => {
    const error: APIErrorResponse = {
      error: 'Not found',
      statusCode: 404,
    };

    expect(isAPIError(error)).toBe(true);
  });

  it('returns true for error with optional fields', () => {
    const error: APIErrorResponse = {
      error: 'Bad request',
      statusCode: 400,
      message: 'Invalid input',
      digest: 'abc123',
    };

    expect(isAPIError(error)).toBe(true);
  });

  it('returns false for objects missing error field', () => {
    const notError = {
      statusCode: 404,
      message: 'Something',
    };

    expect(isAPIError(notError)).toBe(false);
  });

  it('returns false for objects missing statusCode field', () => {
    const notError = {
      error: 'Something',
      message: 'Something else',
    };

    expect(isAPIError(notError)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isAPIError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isAPIError(undefined)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isAPIError('error')).toBe(false);
    expect(isAPIError(404)).toBe(false);
    expect(isAPIError(true)).toBe(false);
  });

  it('returns false for arrays', () => {
    expect(isAPIError([])).toBe(false);
    expect(isAPIError([{ error: 'test', statusCode: 404 }])).toBe(false);
  });

  it('returns false for empty objects', () => {
    expect(isAPIError({})).toBe(false);
  });

  it('returns false for success responses', () => {
    const successResponse = {
      data: { items: [] },
      total: 0,
    };

    expect(isAPIError(successResponse)).toBe(false);
  });
});

describe('createErrorResponse helper', () => {
  it('creates error response with required fields', () => {
    const error = createErrorResponse('Test Error', 400);

    expect(error).toEqual({
      error: 'Test Error',
      statusCode: 400,
    });
  });

  it('includes optional message', () => {
    const error = createErrorResponse('Test Error', 400, 'Detailed message');

    expect(error).toEqual({
      error: 'Test Error',
      statusCode: 400,
      message: 'Detailed message',
    });
  });

  it('includes optional digest', () => {
    const error = createErrorResponse('Test Error', 500, 'Server error', 'xyz789');

    expect(error).toEqual({
      error: 'Test Error',
      statusCode: 500,
      message: 'Server error',
      digest: 'xyz789',
    });
  });

  it('omits optional fields when not provided', () => {
    const error = createErrorResponse('Test Error', 404);

    expect(error).not.toHaveProperty('message');
    expect(error).not.toHaveProperty('digest');
  });

  it('creates object that passes isAPIError type guard', () => {
    const error = createErrorResponse('Test', 500);

    expect(isAPIError(error)).toBe(true);
  });
});
