# Composable Storefront on Vercel  
**Next.js App Router + commercetools + Contentful (locale-scoped)**

A demo storefront showing a **headless**, **composable** e-commerce architecture on **Vercel**, built with **Next.js App Router**, **commercetools** (catalog & pricing), and **Contentful** (CMS). It demonstrates **per-locale caching**, **selective revalidation**, and a thin **headless API façade**.

## What this demo shows

- **Modern App Router setup**  
  - Routes live under a locale segment: `app/[locale]/…` (`de-DE`, `en-GB`)  
  - Co-located handlers: `app/[locale]/api/*` (locale in the path = cache key)  
  - Strict TypeScript + DTO layer (`/lib/*/dto`) decoupled from vendors

- **Per-locale caching & tags**  
  - Pages/API use `unstable_cache` with **per-locale keys & tags**  
  - ISR on cacheable pages (Home/PLP/Nav), **no cookies** on those routes  
  - Event-driven revalidation by tag (per locale)

- **Fresh PDP at the Edge**  
  - PDP is **Edge SSR** + `no-store` (price/stock correctness)  
  - Pricing context (`currency`, `country`) passed via **query params** (not cookies)

## High-level architecture



```
Browser
  │
  ├─ Edge Middleware (anonymous session, segment cookie)
  │
  └─ Next.js (App Router)
      ├─ Pages (Home, PLP, PDP) -> fetch from local /api Facade
      ├─ /[locale]/page.tsx (Home, ISR)
      ├─ /[locale]/category/[slug] (PLP, ISR)
      ├─ /[locale]/products/[id] (PDP, Edge SSR, no-store)
      ├─ /[locale]/api/products, /[id] (cookie-free)
      ├─ /[locale]/api/categories, /[slug]/products
      └─ /[locale]/api/cms/home, /home/categories/[slug]

Data Providers
  ├─ commercetools (catalog, prices, categories)
  └─ Contentful (home hero/copy, featured categories, section labels)

```


## Key decisions & trade-offs

- **Locale in the URL (path)**  
  Locale is the first segment (`/[locale]/…`). This keeps **CDN/ISR caches per locale** naturally and avoids cookie-driven dynamism.

- **Cookie-free cacheable APIs**  
  Cacheable APIs (Home, Categories, PLP) **do not read cookies**. Identity/context that affects cache keys must be in the URL (path/query). HTTP responses are usually `Cache-Control: no-store`; we rely on `unstable_cache` + tags for speed/freshness.

- **PDP correctness over cacheability**  
  PDP renders on **Edge** with `revalidate = 0` and all product fetches `cache: 'no-store'`. Currency/country come from query params (default derived from locale), so no accidental cache coupling.

- **Next 15 compliance**  
  In **pages and route handlers**, `params` and `searchParams` are **Promises** and must be awaited:
  
```ts
  export async function GET(req, ctx: { params: Promise<{ locale: string }> }) {
    const { locale } = await ctx.params;
  }
  // and in pages:
  export default async function Page({
    params, searchParams,
  }: {
    params: Promise<...>;
    searchParams: Promise<...>;
  }) { ... }
```


## Routes & caching

### Home (`/[locale]`)
- **Page**: `app/[locale]/page.tsx`  
  - `export const revalidate = 300` (ISR)
  - Fetches `/${locale}/api/cms/home` (no cookies)
  - Tags: `cms:home:<locale>`, `categories:<locale>`, `products:<locale>` (as needed)

- **API**: `app/[locale]/api/cms/home/route.ts`  
  - `unstable_cache` per **locale** (+ `preview`)
  - Tag: `cms:home:<locale>`
  - HTTP: `Cache-Control: no-store` (perf via `unstable_cache`)

---

### Categories / Nav
- **API**: `app/[locale]/api/categories/route.ts`  
  - `unstable_cache` per **locale**
  - Tag: `categories:<locale>`

- **Layout**: `app/[locale]/layout.tsx`  
  - Fetch: `/${locale}/api/categories`
  - `next: { revalidate: 3600, tags: ['categories:<locale>'] }`
  - No `headers()` / `cookies()`; use `notFound()` for invalid locales

---

### PLP (`/[locale]/category/[slug]`)
- **Page**: ISR (e.g., `export const revalidate = 600`)
- **API**: `app/[locale]/api/categories/[slug]/products/route.ts`
  - `unstable_cache` key includes: `slug`, `locale`, `qs`, `currency`, `country`
  - Tag: `plp:cat:<slug>:<locale>`
  - If slug belongs to the other locale: **308 redirect** to the locale-correct slug

---

### PDP (`/[locale]/products/[id]`)
- **Page**: `export const runtime = 'edge'`; `export const revalidate = 0`
  - Product fetches are `cache: 'no-store'` (correctness for price/stock)

- **API**: `app/[locale]/api/products/[id]/route.ts`
  - Reads `currency`/`country` from **query params** (defaults from locale)
  - Returns **ProductProjectionDTO**
  - HTTP: `Cache-Control: no-store`

---

### Products list (`/[locale]/api/products`)
- Cookie-free; `currency`/`country` from query (or locale defaults)
- `unstable_cache` tag: `products:<locale>`
- HTTP: `Cache-Control: no-store`


## Tech stack

- **Runtime:** Next.js 15.5 (App Router), Vercel (Edge + Node runtimes)
- **Commerce:** commercetools SDK (anonymous sessions)
- **CMS:** Contentful (CDA, optional Preview API)
- **Styling:** Tailwind CSS v4
- **Images:** next/image with responsive sizes
- **TypeScript** everywhere; eslint + strict mode
- **Testing:** Vitest with React Testing Library

## Local setup

1. Install

```
pnpm install
```

2. Environment
Create `.env.local` (sample—adjust to your project/region):
```
# Base
NODE_ENV=development
NEXT_PUBLIC_BASE_PATH=http://localhost:3000

# commercetools
CT_PROJECT_KEY=your-project
CT_CLIENT_ID=your-client-id
CT_CLIENT_SECRET=your-client-secret
CT_AUTH_URL=https://auth.europe-west1.gcp.commercetools.com
CT_API_URL=https://api.europe-west1.gcp.commercetools.com
CT_SUBSCRIPTION_SECRET=long-random-string

# Contentful
CONTENTFUL_SPACE_ID=xxxx
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CDA_TOKEN=xxxx
CONTENTFUL_PREVIEW_ENABLED=false
# CONTENTFUL_CPA_TOKEN=xxxx (optional for preview)
CONTENTFUL_WEBHOOK_SECRET=long-random-string
```

3. Run
```
pnpm dev
```
Visit `http://localhost:3000`.

4. Test (optional)
```
pnpm test          # Run tests once
pnpm test:watch    # Run tests in watch mode
pnpm test:coverage # Generate coverage report
```

## Webhooks / Subscriptions (optional but recommended)
**commercetools Subscription**
- Merchant Center → Project settings → Subscriptions
- Destination: HTTP → POST https://<domain>/api/ct/webhook
- Authorization: Bearer ${CT_SUBSCRIPTION_SECRET}
- Select Messages (products/categories). Save.

**Contentful Webhook**
- Settings → Webhooks → + Add webhook
- URL: POST https://<domain>/api/cms/webhook
- Authorization: Bearer ${CONTENTFUL_WEBHOOK_SECRET}
- Trigger on publish/unpublish for the homepage content type.

## Code Architecture & Best Practices

This codebase follows modern architectural patterns for maintainability and consistency.

### 📋 AI/LLM Guardrails

**See `.ai/` directory for comprehensive coding standards and guardrails.**

These guardrails define:
- TypeScript standards and type safety requirements
- Next.js 15 patterns and conventions
- File organization and naming rules
- Error handling patterns
- Caching strategy guidelines
- Component development best practices
- Testing requirements

When making changes or using AI assistants, refer to `.ai/README.md` for the full set of standards.

### Shared Utilities
- **Price Formatting** (`lib/utils/formatPrice.tsx`): Centralized price display with discount handling
- **Locale Validation** (`lib/i18n/locales.tsx`): Type-safe locale validation utilities
- **Cache Tags** (`lib/cache/tags.ts`): Centralized cache tag generation for consistent revalidation
- **Cache Configuration** (`lib/config/cache.ts`): Centralized cache revalidation time constants
- **Placeholder Constants** (`lib/config/placeholders.ts`): Centralized placeholder image paths
- **Error Handling** (`lib/utils/apiErrors.ts`): Standardized API error responses used across all API routes
- **API Types** (`lib/types/api.ts`): Shared TypeScript types for API contracts

### UI Components
- **Error Boundaries** (`components/ErrorBoundary.tsx`): User-friendly error displays
- **Loading States** (`components/LoadingState.tsx`): Reusable loading spinners and skeletons
- **Error/Loading Routes**: Each route has `error.tsx` and `loading.tsx` files

### Type Safety
- **Contentful Types** (`lib/contentful/types.ts`): Type-safe CMS content access
- **DTO Layer** (`lib/*/dto/`): Decoupled data transfer objects for vendor APIs
- **Strict TypeScript**: Full type coverage with strict mode enabled

### Testing
- **Unit Tests**: Tests for utilities in `__tests__` directories
- **Vitest**: Fast unit test runner with React Testing Library
- **Coverage**: Run `pnpm test:coverage` for coverage reports

## Known limitations / next steps
- **Cart & checkout:** stub only (intentionally out of scope for demo).
- **A/B or geo personalization:** demo uses low-entropy segment cookie; can extend via Edge Config.
- **Variant selection:** Non-functional in demo; would require client-side state or shallow routing in production.
- **Expand test coverage:** Add integration tests and E2E tests with Playwright.

## License
This repository is provided for demo purposes only. Check vendor SDK licenses commercetools, Contentful and ensure you comply with their terms before production use.