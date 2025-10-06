# Composable Storefront on Vercel (Next.js + commercetools + Contentful)

A demo storefront that showcases a **headless**, **composable** e-commerce architecture on **Vercel**, built with **Next.js App Router**, **commercetools (catalog & pricing)**, and **Contentful (home page CMS)**. It demonstrates **Edge personalization**, **selective cache revalidation**, and a clean separation of concerns via a thin **headless API façade**.

## What this demo shows

- Modern app architecture
    - Next.js App Router with colocated route handlers (/app/api/*)
    - Clean lib separation: `/lib/ct` (commercetools), `/lib/contentful` (CMS), `/lib/*/dto` (UI-safe models)
    - Headless façade (`/api/products`, `/api/categories`,`/api/cms/home`) used by pages/components
- Personalization at the edge
    - Edge Middleware creates/reads an anonymous session and sets a low-entropy “segment” cookie
    - Pages can adapt content without sacrificing cacheability (segment-scoped rendering)
- Performance & caching
    - `unstable_cache` + **cache** tags for surgical revalidation (no blanket purges)
    - ISR-style 'revalidate' windows where appropriate, `next/image` w/ responsive `sizes` for LCP
- Selective freshness via events
    - commercetools Subscriptions → webhook → `revalidateTag('products' | 'product:<id>' | 'categories' | 'plp:cat:<slug>')`
    - Contentful Webhook → revalidateTag('cms:home') for instant homepage updates

## High-level Architecture

```
Browser
  │
  ├─ Edge Middleware (anonymous session, segment cookie)
  │
  └─ Next.js (App Router)
      ├─ Pages (Home, PLP, PDP) -> fetch from local /api Facade
      ├─ /api/products, /api/products/[id] -> commercetools SDK (read)
      ├─ /api/categories -> CT list + build tree (parent→children)
      ├─ /api/cms/home -> Contentful (HomeDTO)
      ├─ /api/ct/webhook -> CT Subscriptions → revalidateTag(...)
      └─ /api/cms/webhook -> Contentful Webhook → revalidateTag('cms:home')

Data Providers
  ├─ commercetools (catalog, prices, categories)
  └─ Contentful (home hero/copy, featured categories, section labels)

```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Key decisions & trade-offs

- Headless façade: UI only talks to `/api/*`. Swappable provider behind the API contract; stabilizes UI.
- DTOs: decouple vendor payloads from components; UI is shielded from breaking schema changes.
- Edge middleware: keep logic **minimal** (cookies/segments only). Heavy lifting stays in route handlers.
- Category tree: CT REST doesn’t return `children`. We fetch all categories (paged, sorted by orderHint) and build the tree in memory.
- Cache strategy: use `unstable_cache` with stable keys; read dynamic sources (e.g., `cookies()`) outside cache scopes and pass as arguments.

## Features by page

- **Home**
    - CMS-driven Hero (title, subtitle, CTA, hero image)
    - Category tiles (top-level categories; optionally limited by featured slugs from CMS)
    - Product strip (“Recommended”) with compact, responsive images
- **Category PLP** (`/category/[slug]`)
    - Category-scoped product listing via headless `/api/categories/[slug]/products`
    - Tagged revalidation: `plp:cat:<slug>`
- **Product PDP** (`/products/[id]`)
    - UI-safe ProductDTO; tag `product:<id>` for targeted invalidation
- **Global Nav**
    - Top-level categories visible in the bar, mobile scroller, optional “More” overflow
    - Basket icon stub (badge ready)

## Caching & revalidation

- Cache tags
    - Products list: `products`
    - Product details: `product:<id>`
    - Category tree: `categories`
    - Category PLP: `plp:cat:<slug>`
    - CMS home: `cms:home`
- Event-driven invalidation
    - commercetools → `/api/ct/webhook`
        - Product change → revalidate `products`, `product:<id>`, and all related category PLPs
        - Category change → revalidate `categories` and that category’s PLP
    - Contentful → `/api/cms/webhook`
        - Home content change → revalidate `cms:home`

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
DEMO_DEFAULT_LOCALE=en-GB
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

## Folder structure (trimmed)

```
app/
  api/
    products/route.ts
    products/[id]/route.ts
    categories/route.ts
    categories/[slug]/products/route.ts
    cms/home/route.ts
    cms/webhook/route.ts
    ct/webhook/route.ts
  category/[slug]/page.tsx
  products/[id]/page.tsx
  products/page.tsx
  page.tsx
components/
  Hero.tsx
  CategoryTiles.tsx
  ProductSlider.tsx
  ProductStripClient.tsx
  Nav.tsx
lib/
  ct/
    client.ts
    appClient.ts
    queries.ts
    categories.ts
    dto/
      product.ts
      category.ts
  contentful/
    client.ts
    home.ts
    dto/
      home.ts
middleware.ts
```

## Known limitations / next steps
- **Cart & checkout:** stub only (intentionally out of scope for demo).
- **A/B or geo personalization:** demo uses low-entropy segment cookie; can extend via Edge Config.
- **Contentful typings:** consider generating types from the space to remove remaining “stringly typed” areas.
- **Testing:** add unit tests for DTO mappers and a minimal Playwright flow (home → category → PDP).

## License
This repository is provided for demo purposes only. Check vendor SDK licenses commercetools, Contentful and ensure you comply with their terms before production use.