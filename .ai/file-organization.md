# File Organization

## Directory Structure

```
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Locale-specific routes
│   │   ├── api/                  # API routes under locale
│   │   ├── products/             # Product pages
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page
│   └── api/                      # Global API routes (webhooks)
├── components/                   # React components
│   ├── cart/                     # Cart-related components
│   ├── pdp/                      # Product detail components
│   ├── ErrorBoundary.tsx         # Shared error boundary
│   └── LoadingState.tsx          # Shared loading states
├── lib/                          # Business logic and utilities
│   ├── cache/                    # Cache-related utilities
│   ├── config/                   # Configuration constants
│   │   ├── cache.ts              # Cache revalidation times
│   │   └── placeholders.ts       # Placeholder constants
│   ├── contentful/               # CMS integration
│   │   ├── dto/                  # CMS DTOs
│   │   └── types.ts              # CMS type definitions
│   ├── ct/                       # CommerceTools integration
│   │   └── dto/                  # CommerceTools DTOs
│   ├── i18n/                     # Internationalization
│   │   └── __tests__/            # i18n tests
│   ├── types/                    # Shared TypeScript types
│   └── utils/                    # Utility functions
│       ├── __tests__/            # Utility tests
│       └── apiErrors.ts          # API error handling
└── .ai/                          # LLM guardrails (this directory)
```

## Naming Conventions

### Files and Directories

✅ **REQUIRED:**

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `ProductCard.tsx`, `ErrorBoundary.tsx` |
| Utilities | camelCase | `formatPrice.tsx`, `apiErrors.ts` |
| Types/Interfaces | camelCase | `api.ts`, `types.ts` |
| Config Files | camelCase | `cache.ts`, `placeholders.ts` |
| API Routes | camelCase | `route.ts` |
| Tests | camelCase with `.test.ts` suffix | `locales.test.ts` |

❌ **AVOID:**
- kebab-case for components: `product-card.tsx`
- lowercase for components: `productcard.tsx`
- Inconsistent naming: mixing PascalCase and camelCase in same directory

### Component Files

✅ **GOOD:**
```
components/
├── Card.tsx              # PascalCase
├── ProductCard.tsx       # PascalCase
├── LangSwitcher.tsx      # PascalCase
└── cart/
    └── CartClient.tsx    # PascalCase
```

❌ **BAD:**
```
components/
├── card.tsx              # lowercase
├── product-card.tsx      # kebab-case
└── lang_switcher.tsx     # snake_case
```

## Component Organization

### Grouping by Feature

✅ **PREFER** feature-based grouping for related components:

```
components/
├── cart/
│   ├── CartClient.tsx
│   └── CartCountClient.tsx
└── pdp/
    ├── AddToBasketClient.tsx
    ├── ProductGalleryClient.tsx
    └── VariantPickerClient.tsx
```

### Shared vs. Feature Components

- **Shared components** (used across features): `components/` root
- **Feature components** (specific to one feature): `components/{feature}/`

## Library Organization

### DTOs (Data Transfer Objects)

✅ **MUST** organize DTOs by data source:

```
lib/
├── ct/dto/              # CommerceTools DTOs
│   ├── product.ts
│   ├── category.ts
│   └── cart.ts
└── contentful/dto/      # Contentful DTOs
    ├── home.ts
    └── category.ts
```

### Configuration Constants

✅ **MUST** place all configuration in `lib/config/`:

```
lib/config/
├── cache.ts             # Cache revalidation constants
└── placeholders.ts      # Placeholder image paths
```

❌ **AVOID** magic numbers/strings scattered across codebase

## Import Organization

### Import Order

✅ **REQUIRED ORDER:**

```typescript
// 1. React and Next.js
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 2. External libraries
import { clsx } from 'clsx';

// 3. Internal types (with 'type' keyword)
import type { ProductDTO } from '@/lib/ct/dto/product';
import type { SupportedLocale } from '@/lib/i18n/locales';

// 4. Internal utilities and components
import { formatPrice } from '@/lib/utils/formatPrice';
import { CACHE_REVALIDATION } from '@/lib/config/cache';
import { Card } from '@/components/Card';

// 5. Relative imports (if any)
import { helper } from './helper';
```

### Path Aliases

✅ **MUST** use `@/` alias for absolute imports:

```typescript
import { ProductCard } from '@/components/ProductCard';
import { formatPrice } from '@/lib/utils/formatPrice';
```

❌ **AVOID** relative imports for cross-directory references:

```typescript
import { ProductCard } from '../../../components/ProductCard';
```

## Test Organization

✅ **MUST** colocate tests with the code they test:

```
lib/
├── utils/
│   ├── __tests__/
│   │   └── formatPrice.test.ts
│   └── formatPrice.tsx
└── i18n/
    ├── __tests__/
    │   └── locales.test.ts
    └── locales.tsx
```

## Export Patterns

### Named Exports (Preferred)

✅ **PREFER** named exports for components:

```typescript
// components/ProductCard.tsx
export function ProductCard({ product }: ProductCardProps) {
  // ...
}
```

### Default Exports

✅ **USE** default exports for:
- Page components (`page.tsx`)
- Layout components (`layout.tsx`)
- Error boundaries (`error.tsx`)
- Loading states (`loading.tsx`)

```typescript
// app/[locale]/page.tsx
export default async function HomePage({ params }: PageProps) {
  // ...
}
```

## File Size Guidelines

- ✅ **TARGET** files under 300 lines
- ✅ **SPLIT** files over 500 lines into smaller modules
- ✅ **EXTRACT** reusable logic into separate utility files
