import { describe, it, expect } from 'vitest';
import {
  ErrorResponses,
  HTTP_STATUS,
  createErrorResponse,
} from '../apiErrors';

describe('HTTP_STATUS constants', () => {
  it('defines standard HTTP status codes', () => {
    expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.METHOD_NOT_ALLOWED).toBe(405);
    expect(HTTP_STATUS.CONFLICT).toBe(409);
    expect(HTTP_STATUS.UNPROCESSABLE_ENTITY).toBe(422);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    expect(HTTP_STATUS.SERVICE_UNAVAILABLE).toBe(503);
  });
});

describe('createErrorResponse', () => {
  it('creates error response with required fields', async () => {
    const response = createErrorResponse('Test Error', 400);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toEqual({
      error: 'Test Error',
      statusCode: 400,
    });
  });

  it('includes optional message', async () => {
    const response = createErrorResponse('Test Error', 400, 'Detailed message');
    const body = await response.json();

    expect(body).toEqual({
      error: 'Test Error',
      statusCode: 400,
      message: 'Detailed message',
    });
  });

  it('omits message when not provided', async () => {
    const response = createErrorResponse('Test Error', 400);
    const body = await response.json();

    expect(body).not.toHaveProperty('message');
  });
});

describe('ErrorResponses.localeNotSupported', () => {
  it('returns 400 status', async () => {
    const response = ErrorResponses.localeNotSupported();
    expect(response.status).toBe(400);
  });

  it('returns correct error structure', async () => {
    const response = ErrorResponses.localeNotSupported();
    const body = await response.json();

    expect(body).toEqual({
      error: 'Locale not supported',
      statusCode: 400,
      message: 'The requested locale is not supported',
    });
  });
});

describe('ErrorResponses.notFound', () => {
  it('returns 404 status', async () => {
    const response = ErrorResponses.notFound();
    expect(response.status).toBe(404);
  });

  it('uses default resource name', async () => {
    const response = ErrorResponses.notFound();
    const body = await response.json();

    expect(body.message).toBe('Resource not found');
  });

  it('uses custom resource name', async () => {
    const response = ErrorResponses.notFound('Product');
    const body = await response.json();

    expect(body.message).toBe('Product not found');
  });
});

describe('ErrorResponses.badRequest', () => {
  it('returns 400 status', async () => {
    const response = ErrorResponses.badRequest();
    expect(response.status).toBe(400);
  });

  it('includes custom message when provided', async () => {
    const response = ErrorResponses.badRequest('Invalid email format');
    const body = await response.json();

    expect(body.message).toBe('Invalid email format');
  });
});

describe('ErrorResponses.unauthorized', () => {
  it('returns 401 status', async () => {
    const response = ErrorResponses.unauthorized();
    expect(response.status).toBe(401);
  });

  it('returns correct error message', async () => {
    const response = ErrorResponses.unauthorized();
    const body = await response.json();

    expect(body.error).toBe('Unauthorized');
    expect(body.message).toBe('Authentication required');
  });
});

describe('ErrorResponses.forbidden', () => {
  it('returns 403 status', async () => {
    const response = ErrorResponses.forbidden();
    expect(response.status).toBe(403);
  });

  it('returns correct error message', async () => {
    const response = ErrorResponses.forbidden();
    const body = await response.json();

    expect(body.error).toBe('Forbidden');
    expect(body.message).toBe('You do not have permission to access this resource');
  });
});

describe('ErrorResponses.methodNotAllowed', () => {
  it('returns 405 status', async () => {
    const response = ErrorResponses.methodNotAllowed();
    expect(response.status).toBe(405);
  });

  it('returns correct error message', async () => {
    const response = ErrorResponses.methodNotAllowed();
    const body = await response.json();

    expect(body.message).toBe('HTTP method not allowed for this endpoint');
  });
});

describe('ErrorResponses.internalServerError', () => {
  it('returns 500 status', async () => {
    const response = ErrorResponses.internalServerError();
    expect(response.status).toBe(500);
  });

  it('uses default message', async () => {
    const response = ErrorResponses.internalServerError();
    const body = await response.json();

    expect(body.message).toBe('An unexpected error occurred');
  });

  it('uses custom message when provided', async () => {
    const response = ErrorResponses.internalServerError('Database connection failed');
    const body = await response.json();

    expect(body.message).toBe('Database connection failed');
  });
});

describe('ErrorResponses.serviceUnavailable', () => {
  it('returns 503 status', async () => {
    const response = ErrorResponses.serviceUnavailable();
    expect(response.status).toBe(503);
  });

  it('returns correct error message', async () => {
    const response = ErrorResponses.serviceUnavailable();
    const body = await response.json();

    expect(body.error).toBe('Service unavailable');
    expect(body.message).toBe('The service is temporarily unavailable');
  });
});
