# TypeScript Standards

## Strict Mode Requirements

- ✅ **MUST** use TypeScript strict mode (`strict: true` in tsconfig.json)
- ✅ **MUST** avoid `any` type - use `unknown` with type guards instead
- ✅ **MUST** define explicit return types for public functions
- ✅ **MUST** use proper type imports with `import type` for type-only imports

## Type Safety Rules

### Avoid `any` Type

❌ **BAD:**
```typescript
const data: any = await fetch(url);
const items = data.map((item: any) => item.name);
```

✅ **GOOD:**
```typescript
const data: unknown = await fetch(url);
if (Array.isArray(data)) {
  const items = data.map((item) => {
    if (typeof item === 'object' && item !== null && 'name' in item) {
      return (item as { name: string }).name;
    }
  });
}
```

### Use Type Imports

❌ **BAD:**
```typescript
import { ProductDTO } from '@/lib/ct/dto/product';
```

✅ **GOOD:**
```typescript
import type { ProductDTO } from '@/lib/ct/dto/product';
```

### Explicit Function Return Types

❌ **BAD:**
```typescript
export async function getProducts(locale: string) {
  return fetch(`/api/products?locale=${locale}`);
}
```

✅ **GOOD:**
```typescript
export async function getProducts(locale: SupportedLocale): Promise<ProductDTO[]> {
  const res = await fetch(`/api/products?locale=${locale}`);
  return res.json();
}
```

## Unused Variables

- ✅ **MUST** remove unused imports and variables
- ✅ **MUST** prefix intentionally unused parameters with underscore `_`

❌ **BAD:**
```typescript
export function mapProduct(product: Product, locale: string) {
  return { id: product.id, name: product.name };
}
```

✅ **GOOD:**
```typescript
export function mapProduct(product: Product, _locale: string): ProductDTO {
  return { id: product.id, name: product.name };
}
```

## Type Guards

- ✅ **MUST** use type guards for runtime validation
- ✅ **MUST** create dedicated type guard functions in shared utilities

```typescript
// lib/i18n/locales.tsx
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

// Usage in code
if (!isSupportedLocale(locale)) {
  return ErrorResponses.localeNotSupported();
}
```

## DTO Layer

- ✅ **MUST** define DTOs in `lib/*/dto/` directories
- ✅ **MUST** keep DTOs decoupled from vendor SDK types
- ✅ **MUST** use mapper functions to convert vendor types to DTOs

```typescript
// lib/ct/dto/product.ts
export interface ProductDTO {
  id: string;
  name: string;
  // ... application-specific fields
}

// lib/ct/products.ts
export function mapProductToDTO(product: CommerceToolsProduct): ProductDTO {
  return {
    id: product.id,
    name: product.name,
  };
}
```

## Non-Null Assertions

- ❌ **AVOID** non-null assertion operator `!` unless absolutely necessary
- ✅ **PREFER** optional chaining and type guards

❌ **BAD:**
```typescript
const price = product.price!.amount;
```

✅ **GOOD:**
```typescript
const price = product.price?.amount;
```

## Const Assertions

- ✅ **MUST** use `as const` for object/array literals used as types

```typescript
export const CACHE_REVALIDATION = {
  HOME: 300,
  CATEGORY: 600,
} as const;
```
