# Testing Requirements

## Test Framework

- ✅ **REQUIRED:** Vitest for unit and integration tests
- ✅ **REQUIRED:** React Testing Library for component tests
- ✅ **REQUIRED:** jsdom environment for DOM testing

## Test Organization

### Colocation

✅ **MUST** colocate tests with source code:

```
lib/
├── utils/
│   ├── __tests__/
│   │   ├── formatPrice.test.ts
│   │   └── apiErrors.test.ts
│   ├── formatPrice.tsx
│   └── apiErrors.ts
└── i18n/
    ├── __tests__/
    │   └── locales.test.ts
    └── locales.tsx
```

### Test File Naming

✅ **REQUIRED:**
- Use `.test.ts` or `.test.tsx` suffix
- Match the name of the file being tested

```
formatPrice.tsx  →  formatPrice.test.ts
locales.tsx      →  locales.test.ts
Card.tsx         →  Card.test.tsx
```

## Test Structure

### Describe/It Pattern

✅ **REQUIRED:**

```typescript
import { describe, it, expect } from 'vitest';
import { formatPrice } from '../formatPrice';

describe('formatPrice', () => {
  it('formats price with currency symbol', () => {
    const result = formatPrice({ currencyCode: 'EUR', centAmount: 1999 });
    expect(result).toBe('€19.99');
  });

  it('handles discounted prices', () => {
    const result = formatPrice(
      { currencyCode: 'EUR', centAmount: 2999 },
      { currencyCode: 'EUR', centAmount: 1999 }
    );
    expect(result).toContain('€19.99');
    expect(result).toContain('€29.99');
  });

  it('returns dash for missing price', () => {
    const result = formatPrice(undefined);
    expect(result).toBe('—');
  });
});
```

## What to Test

### Utility Functions

✅ **MUST TEST:**
- All exported utility functions
- Edge cases and error conditions
- Type conversions and validations

```typescript
// lib/utils/__tests__/formatPrice.test.ts
describe('formatPrice', () => {
  it('formats EUR prices correctly', () => { /* ... */ });
  it('formats GBP prices correctly', () => { /* ... */ });
  it('handles zero amounts', () => { /* ... */ });
  it('handles undefined prices', () => { /* ... */ });
  it('shows original and discounted prices', () => { /* ... */ });
});
```

### Business Logic

✅ **MUST TEST:**
- Locale validation and conversion
- Price calculations
- Data transformations
- Cache tag generation

```typescript
// lib/i18n/__tests__/locales.test.ts
describe('isSupportedLocale', () => {
  it('returns true for valid locales', () => {
    expect(isSupportedLocale('de-DE')).toBe(true);
    expect(isSupportedLocale('en-GB')).toBe(true);
  });

  it('returns false for invalid locales', () => {
    expect(isSupportedLocale('fr-FR')).toBe(false);
    expect(isSupportedLocale('invalid')).toBe(false);
  });
});
```

### Type Guards

✅ **MUST TEST:**

```typescript
describe('isAPIError', () => {
  it('identifies valid error responses', () => {
    const error = { error: 'Not found', statusCode: 404 };
    expect(isAPIError(error)).toBe(true);
  });

  it('rejects non-error objects', () => {
    expect(isAPIError({})).toBe(false);
    expect(isAPIError({ data: 'value' })).toBe(false);
    expect(isAPIError(null)).toBe(false);
  });
});
```

## Component Testing

### Setup

✅ **PATTERN:**

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

describe('ProductCard', () => {
  const mockProduct: ProductDTO = {
    id: '123',
    name: 'Test Product',
    variants: [{
      id: 1,
      price: { currencyCode: 'EUR', centAmount: 1999 }
    }],
  };

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} locale="de-DE" />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} locale="de-DE" />);
    expect(screen.getByText(/€19\.99/)).toBeInTheDocument();
  });
});
```

### User Interactions

✅ **TEST user events:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

it('calls onClick handler when clicked', () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  fireEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Mocking

### Fetch Mocking

✅ **PATTERN for API calls:**

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

describe('fetchProducts', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches products successfully', async () => {
    const mockProducts = [{ id: '1', name: 'Product 1' }];
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockProducts,
    });

    const result = await fetchProducts('de-DE');
    expect(result).toEqual(mockProducts);
  });
});
```

### Module Mocking

✅ **PATTERN:**

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/ct/client', () => ({
  apiRootApp: {
    products: () => ({
      get: vi.fn().mockResolvedValue({ body: { results: [] } }),
    }),
  },
}));
```

## Coverage Requirements

### Target Coverage

- ✅ **TARGET:** 80% code coverage for utilities
- ✅ **TARGET:** 70% code coverage for business logic
- ✅ **MINIMUM:** All type guards must have tests
- ✅ **MINIMUM:** All exported utilities must have tests

### Running Coverage

```bash
npm run test:coverage
```

### Coverage Exceptions

✅ **ACCEPTABLE to skip:**
- UI-only components without logic
- Third-party integrations (mocked)
- Configuration files

## Test Scripts

### Available Commands

```json
{
  "test": "vitest",                    // Run tests in watch mode
  "test:watch": "vitest --watch",      // Explicit watch mode
  "test:coverage": "vitest --coverage" // Generate coverage report
}
```

### Running Tests

```bash
# Run all tests once
npm run test run

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test locales.test.ts
```

## Test Configuration

### Vitest Config

✅ **CURRENT SETUP:**

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
  css: {
    postcss: {
      plugins: [], // Disable PostCSS for tests
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### Setup File

✅ **CURRENT SETUP:**

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
```

## Assertions

### Common Assertions

✅ **USE:**

```typescript
// Equality
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Arrays/Objects
expect(array).toContain(item);
expect(array).toHaveLength(3);
expect(object).toHaveProperty('key');

// DOM (with @testing-library/jest-dom)
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('text');
expect(element).toHaveClass('className');

// Functions
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
expect(fn).toHaveBeenCalledTimes(1);
```

## Integration Tests

### API Route Testing

✅ **FUTURE RECOMMENDATION:**

```typescript
import { NextRequest } from 'next/server';
import { GET } from '../route';

describe('GET /api/products', () => {
  it('returns products for valid locale', async () => {
    const req = new NextRequest('http://localhost/de-DE/api/products');
    const ctx = { params: Promise.resolve({ locale: 'de-DE' }) };

    const response = await GET(req, ctx);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(data.items)).toBe(true);
  });
});
```

## Best Practices

### Test Independence

✅ **DO:**
- Each test should be independent
- Clean up after tests
- Don't rely on test execution order

### Test Readability

✅ **DO:**
- Use descriptive test names
- Follow Arrange-Act-Assert pattern
- Keep tests focused and simple

```typescript
it('formats EUR currency with correct symbol and decimals', () => {
  // Arrange
  const price = { currencyCode: 'EUR', centAmount: 1999 };

  // Act
  const result = formatPrice(price);

  // Assert
  expect(result).toBe('€19.99');
});
```

### Avoid Test Pollution

✅ **DO:**

```typescript
import { beforeEach, afterEach } from 'vitest';

describe('MyTest', () => {
  beforeEach(() => {
    // Set up before each test
  });

  afterEach(() => {
    // Clean up after each test
    vi.clearAllMocks();
  });
});
```

## Minimum Requirements

Before pushing code:

- ✅ All existing tests must pass
- ✅ New utilities must have tests
- ✅ New type guards must have tests
- ✅ Critical business logic must have tests
- ✅ No failing tests in CI/CD
