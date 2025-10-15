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

- **Runtime:** Next.js (App Router), Vercel (Edge + Node runtimes)
- **Commerce:** commercetools SDK (anonymous sessions)
- **CMS:** Contentful (CDA, optional Preview API)
- **Styling:** Tailwind CSS
- **Images:** next/image with responsive sizes
- **TypeScript** everywhere; eslint + strict mode

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

## Known limitations / next steps
- **Cart & checkout:** stub only (intentionally out of scope for demo).
- **A/B or geo personalization:** demo uses low-entropy segment cookie; can extend via Edge Config.
- **Contentful typings:** consider generating types from the space to remove remaining “stringly typed” areas.
- **Testing:** add unit tests for DTO mappers and a minimal Playwright flow (home → category → PDP).

## License
This repository is provided for demo purposes only. Check vendor SDK licenses commercetools, Contentful and ensure you comply with their terms before production use.