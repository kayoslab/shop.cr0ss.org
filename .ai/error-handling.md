# Error Handling

## API Error Responses

### Centralized Error Handling

✅ **MUST** use `ErrorResponses` from `lib/utils/apiErrors.ts` for all API routes

```typescript
import { ErrorResponses } from '@/lib/utils/apiErrors';

export async function GET(req: NextRequest, ctx: { params: Promise<{ locale: string }> }) {
  const { locale } = await ctx.params;

  // Locale validation
  if (!isSupportedLocale(locale)) {
    return ErrorResponses.localeNotSupported();
  }

  // Resource not found
  const data = await fetchData(locale);
  if (!data) {
    return ErrorResponses.notFound('Resource name');
  }

  // Success
  return NextResponse.json(data);
}
```

❌ **AVOID** inline error responses:

```typescript
// BAD
if (!isSupportedLocale(locale)) {
  return new NextResponse('Locale not supported', { status: 400 });
}

// BAD
if (!data) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

### Available Error Responses

```typescript
// lib/utils/apiErrors.ts provides:

ErrorResponses.localeNotSupported()           // 400 - Invalid locale
ErrorResponses.notFound(resource?: string)     // 404 - Resource not found
ErrorResponses.badRequest(message?: string)    // 400 - Bad request
ErrorResponses.unauthorized()                  // 401 - Not authenticated
ErrorResponses.forbidden()                     // 403 - Not authorized
ErrorResponses.methodNotAllowed()              // 405 - Wrong HTTP method
ErrorResponses.internalServerError(message?)   // 500 - Server error
ErrorResponses.serviceUnavailable()            // 503 - Service down
```

### Consistent Error Response Format

All API errors return this format:

```typescript
interface APIErrorResponse {
  error: string;        // Error type
  message?: string;     // Human-readable message
  statusCode: number;   // HTTP status code
  digest?: string;      // Error tracking ID
}
```

## Client-Side Error Handling

### Error Boundaries

✅ **MUST** use `ErrorBoundary` component for error.tsx files:

```typescript
// app/[locale]/products/[id]/error.tsx
'use client';

import ErrorBoundary from '@/components/ErrorBoundary';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} reset={reset} />;
}
```

❌ **AVOID** custom error UIs - use the shared component:

```typescript
// BAD - Don't create custom error UIs
export default function ProductError({ error }: { error: Error }) {
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

### Error Boundary Hierarchy

- ✅ Root level: `app/[locale]/error.tsx` (catches all errors)
- ✅ Feature level: `app/[locale]/products/[id]/error.tsx` (catches specific feature errors)

## Data Fetching Error Handling

### API Route Error Handling

✅ **PATTERN for protected API calls:**

```typescript
try {
  const data = await fetch('/api/products');
  if (!data.ok) {
    throw new Error('Failed to fetch products');
  }
  return data.json();
} catch (error) {
  console.error('Product fetch error:', error);
  // Let error boundary handle it or return fallback
  return null;
}
```

### Graceful Degradation

✅ **PREFER** returning null/empty arrays over throwing:

```typescript
async function fetchProducts(locale: SupportedLocale): Promise<ProductDTO[]> {
  try {
    const res = await fetch(`/api/products?locale=${locale}`);
    if (!res.ok) return []; // Graceful degradation
    return res.json();
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return []; // Return empty array instead of throwing
  }
}
```

## Webhook Authentication

✅ **REQUIRED PATTERN for webhook endpoints:**

```typescript
import { ErrorResponses } from '@/lib/utils/apiErrors';

export async function POST(request: NextRequest) {
  const authz = request.headers.get('authorization') || '';
  const expected = process.env.WEBHOOK_SECRET?.trim();

  if (!expected || authz !== `Bearer ${expected}`) {
    return ErrorResponses.unauthorized();
  }

  // Process webhook
}
```

## Validation Errors

### Input Validation

✅ **PATTERN:**

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  if (!body.productId || typeof body.productId !== 'string') {
    return ErrorResponses.badRequest('Invalid productId');
  }

  if (!body.quantity || typeof body.quantity !== 'number' || body.quantity < 1) {
    return ErrorResponses.badRequest('Invalid quantity');
  }

  // Process request
}
```

## Error Logging

### Development vs. Production

✅ **CURRENT PATTERN (development):**

```typescript
console.error('API Error:', error);
```

✅ **PRODUCTION RECOMMENDATION:**

```typescript
// TODO: Replace with proper error monitoring (Sentry, LogRocket, etc.)
if (process.env.NODE_ENV === 'production') {
  // Send to error monitoring service
  errorMonitoring.captureException(error);
} else {
  console.error('API Error:', error);
}
```

## Error Messages

### User-Facing Messages

✅ **DO:**
- Keep messages clear and actionable
- Provide error IDs/digests for support
- Suggest next steps

✅ **GOOD:**
```typescript
return ErrorResponses.notFound('Product');
// Returns: "Product not found"

return ErrorResponses.badRequest('Invalid email format');
// Returns: "Invalid email format"
```

❌ **AVOID:**
- Technical jargon in user messages
- Stack traces in production
- Exposing internal system details

## Type Guards for Error Checking

✅ **USE** type guards from `lib/types/api.ts`:

```typescript
import { isAPIError } from '@/lib/types/api';

const response = await fetch('/api/products');
const data = await response.json();

if (isAPIError(data)) {
  // Handle error
  console.error(data.error, data.message);
  return null;
}

// Use data as successful response
return data;
```

## Error Wrapper for API Routes

✅ **AVAILABLE (but use with caution):**

```typescript
import { withErrorHandler } from '@/lib/utils/apiErrors';

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    // Your API logic here
    // Any thrown errors will be caught and converted to standard error responses
  });
}
```

⚠️ **NOTE:** Explicit error handling is preferred over wrapper for better control
