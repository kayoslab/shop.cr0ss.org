# Project Coding Standards & Guidelines

> **AI Assistant Instructions**: This document contains mandatory coding standards and architectural patterns for this Next.js 15 e-commerce project. You MUST follow these guidelines when generating, modifying, or reviewing code. Read the "Quick Reference" section first, then consult specific documentation files as needed.

This directory contains coding standards, architectural patterns, and best practices for this Next.js 15 e-commerce application. These guidelines must be followed when making any code changes.

## Quick Reference

When working on this codebase, you MUST:

1. **Always use TypeScript strict mode** - No `any` types, explicit return types for public functions
2. **Default to Server Components** - Only use Client Components when interactivity is required
3. **Await params and searchParams** - Next.js 15 requires these to be awaited as Promises
4. **Use centralized error handling** - Import from `@/lib/utils/apiErrors`
5. **Follow the established file structure** - See file-organization.md
6. **Write tests** - All utilities and business logic must have tests

## Documentation Structure

### Core Standards (READ THESE FIRST)

- **[typescript-standards.md](./typescript-standards.md)** - TypeScript rules, type safety, no `any`, DTOs
- **[nextjs-patterns.md](./nextjs-patterns.md)** - Next.js 15 patterns, async params, Server/Client components
- **[component-guidelines.md](./component-guidelines.md)** - React component best practices, naming, composition

### Architecture & Patterns

- **[file-organization.md](./file-organization.md)** - Directory structure, naming conventions, import organization
- **[error-handling.md](./error-handling.md)** - API error responses, error boundaries, validation
- **[caching-strategy.md](./caching-strategy.md)** - ISR, cache tags, revalidation patterns

### Quality Assurance

- **[testing-requirements.md](./testing-requirements.md)** - Test structure, coverage requirements, mocking patterns

## Common Patterns at a Glance

### Next.js 15 Page Component
```typescript
export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params; // MUST await
  // ... component logic
}
```

### API Route Handler
```typescript
import { ErrorResponses } from '@/lib/utils/apiErrors';

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string }> }
) {
  const { locale } = await ctx.params;

  if (!isSupportedLocale(locale)) {
    return ErrorResponses.localeNotSupported();
  }

  // ... handler logic
}
```

### Client Component (Minimal Boundary)
```typescript
'use client';

import { useState } from 'react';

export function ProductFilter({ products }: { products: ProductDTO[] }) {
  const [filter, setFilter] = useState('');
  // ... interactive logic
}
```

### Type-Safe Utility Function
```typescript
export function formatPrice(
  price?: MoneyDTO,
  discountPrice?: MoneyDTO
): string {
  if (!price) return '—';
  // ... formatting logic
}
```

## Critical Rules

### TypeScript
- ❌ NEVER use `any` type
- ✅ ALWAYS use explicit return types for public functions
- ✅ ALWAYS use `import type` for type-only imports
- ✅ ALWAYS use type guards for runtime validation

### Next.js 15
- ❌ NEVER forget to await `params` and `searchParams`
- ✅ ALWAYS use literal values for segment config exports (revalidate, runtime)
- ✅ ALWAYS default to Server Components
- ✅ ALWAYS push Client Components to the leaves of the component tree

### Architecture
- ❌ NEVER inline error responses - use `ErrorResponses`
- ❌ NEVER scatter magic numbers - use config files
- ✅ ALWAYS use centralized constants from `lib/config/`
- ✅ ALWAYS colocate tests with source code

### Components
- ✅ ALWAYS use PascalCase for component files
- ✅ ALWAYS suffix client components with "Client" when mixed with Server Components
- ✅ ALWAYS use `next/image` for images
- ✅ ALWAYS include accessibility attributes (alt, aria-label)

## Project Context

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **Commerce**: CommerceTools SDK
- **CMS**: Contentful
- **i18n**: Locale-based routing with [locale] segments

### Key Directories
```
├── app/[locale]/          # Locale-aware pages and API routes
├── components/            # React components (organized by feature)
├── lib/                   # Business logic, utilities, integrations
│   ├── config/           # Centralized configuration
│   ├── ct/               # CommerceTools integration + DTOs
│   ├── contentful/       # Contentful integration + DTOs
│   ├── i18n/             # Internationalization utilities
│   └── utils/            # Shared utilities
└── .claude/docs/         # This documentation
```

## Before You Code

1. Review the relevant documentation file(s) above
2. Ensure you understand the pattern you need to follow
3. Check for existing examples in the codebase
4. Write tests if creating new utilities or business logic
5. Verify TypeScript has no errors (`npm run type-check`)
6. Run tests before committing (`npm run test`)

## Philosophy

These guidelines exist to ensure:
- **Consistency** - Code should look like it was written by one person
- **Type Safety** - Catch errors at compile time, not runtime
- **Performance** - Leverage Server Components and caching effectively
- **Maintainability** - Clear patterns make code easier to understand and modify
- **Quality** - Tests and type safety prevent regressions

When in doubt, favor:
- **Explicitness over cleverness**
- **Type safety over convenience**
- **Server Components over Client Components**
- **Centralized patterns over local solutions**
- **Testing over hoping it works**

## Updates

If you discover new patterns or need to deviate from these guidelines:
1. Discuss the change first
2. Update the relevant documentation file
3. Ensure consistency across the codebase
4. Update examples if needed

Remember: These are not suggestions - they are requirements for maintaining code quality and consistency in this project.
