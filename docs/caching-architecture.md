# Caching Architecture

This document explains the caching strategy implemented across the e-commerce application, detailing how different pages leverage Next.js 15 caching features and Vercel's infrastructure for optimal performance.

## Table of Contents

- [Overview](#overview)
- [Caching Strategy by Page Type](#caching-strategy-by-page-type)
- [Cache Tags & Revalidation](#cache-tags--revalidation)
- [Vercel Platform Integration](#vercel-platform-integration)
- [Cache Configuration Reference](#cache-configuration-reference)
- [Best Practices](#best-practices)

---

## Overview

The application uses a **hybrid caching strategy** that balances performance with data freshness:

- **Static pages with ISR** (Incremental Static Regeneration) for content that changes infrequently
- **Dynamic rendering** with edge runtime for user-specific and real-time data
- **Locale-aware cache tags** for granular invalidation
- **On-demand revalidation** via webhooks for immediate content updates

### Key Technologies

- **Next.js 15 App Router** - Built-in caching with `fetch()` and `unstable_cache`
- **Vercel Edge Network** - Global CDN with edge caching
- **Edge Runtime** - For ultra-low latency on dynamic pages
- **Cache Tags** - For precise cache invalidation

---

## Caching Strategy by Page Type

### 🏠 Home Page

**Location:** `app/[locale]/page.tsx`

**Strategy:** Incremental Static Regeneration (ISR)

```typescript
export const revalidate = 300; // 5 minutes
```

#### Behavior

- **Static Generation:** Pre-rendered at build time for all supported locales
- **Revalidation:** Background regeneration every 5 minutes
- **Stale-While-Revalidate:** Vercel serves cached version instantly while regenerating
- **Runtime:** Node.js (default)

#### Data Sources & Cache Tags

| Data Source | API Route | Cache Tag | Revalidation |
|-------------|-----------|-----------|--------------|
| Hero & Content | `/api/cms/home` | `cms:home:{locale}` | 5 min |
| Categories | `/api/categories` | `categories:{locale}` | 5 min |
| Category CMS | `/api/cms/categories/{slug}` | `cms:categories:{slug}:{locale}` | 5 min |
| Recommended Products | `/api/products` | `products:{locale}` | 5 min |

#### Implementation

```typescript
// Fetch with cache tags
const res = await fetch(`${base}/${locale}/api/cms/home`, {
  next: {
    revalidate: 300,
    tags: [`cms:home:${locale}`]
  },
});
```

#### Vercel Deployment

- **Build Output:** Static HTML files for each locale (`de-DE`, `en-GB`)
- **Edge Caching:** Cached at edge locations worldwide
- **CDN Behavior:**
  - `Cache-Control: s-maxage=300, stale-while-revalidate=60`
  - Background regeneration on Vercel's serverless functions
- **Cold Starts:** Minimal impact due to static generation

---

### 📋 Product Listing Page (PLP)

**Location:** `app/[locale]/category/[slug]/page.tsx`

**Strategy:** Incremental Static Regeneration (ISR)

```typescript
export const revalidate = 600; // 10 minutes
```

#### Behavior

- **Static Generation:** Pre-rendered at build time for known category slugs
- **On-Demand Generation:** Dynamic slugs generated on first request, then cached
- **Revalidation:** Background regeneration every 10 minutes
- **Runtime:** Node.js (default)

#### Data Sources & Cache Tags

| Data Source | API Route | Cache Tag | Revalidation |
|-------------|-----------|-----------|--------------|
| Product List | `/api/categories/{slug}/products` | `plp:cat:{slug}:{locale}` | 10 min |
| Category CMS | `/api/cms/categories/{slug}` | `cms:categories:{slug}:{locale}` | Inherited |

#### Query Parameters

Search params (`limit`, `offset`) are **part of the cache key**, meaning different pagination states are cached separately.

#### Implementation

```typescript
const res = await fetch(`${base}/${locale}/api/categories/${slug}/products?${qs}`, {
  next: {
    revalidate: 600,
    tags: [`plp:cat:${slug}:${locale}`]
  },
});
```

#### Vercel Deployment

- **Build Output:** Static HTML for featured categories, on-demand for others
- **Edge Caching:** Category pages cached at edge
- **CDN Behavior:**
  - `Cache-Control: s-maxage=600, stale-while-revalidate=120`
  - Longer cache time than home page (10 min vs 5 min)
- **ISR Handling:** Vercel automatically handles background revalidation

---

### 🛍️ Product Detail Page (PDP)

**Location:** `app/[locale]/products/[id]/page.tsx`

**Strategy:** Dynamic rendering with Edge Runtime

```typescript
export const runtime = 'edge';
export const revalidate = 0; // No caching
```

#### Behavior

- **Dynamic Rendering:** Generated on every request
- **No Static Generation:** Always fresh data
- **No ISR:** Real-time pricing and availability
- **Runtime:** Edge (not Node.js)

#### Data Sources

| Data Source | API Route | Cache | Reason |
|-------------|-----------|-------|--------|
| Product Detail | `/api/products/{id}` | `cache: 'no-store'` | Real-time pricing |

#### Implementation

```typescript
const res = await fetch(`${base}/${locale}/api/products/${id}?${qs}`,
  { cache: 'no-store' }
);
```

#### Why Edge Runtime?

- **Low Latency:** Edge functions execute close to users globally
- **Real-time Data:** No stale pricing or stock information
- **Faster Response:** ~50-200ms vs ~500ms+ for Node.js in distant regions
- **Commerce Requirements:** E-commerce pricing needs to be current

#### Vercel Deployment

- **Build Output:** No pre-rendered pages
- **Edge Caching:** **Disabled** (`Cache-Control: no-store`)
- **Execution:** Runs on Vercel Edge Network (100+ locations)
- **Cold Starts:** Negligible (<10ms) due to edge runtime
- **Scalability:** Auto-scales globally based on traffic

---

### 🛒 Cart Page

**Location:** `app/[locale]/cart/page.tsx`

**Strategy:** Dynamic rendering with Edge Runtime + User-specific data

```typescript
export const runtime = 'edge';
export const revalidate = 0; // No caching
```

#### Behavior

- **Dynamic Rendering:** Generated on every request
- **User-Specific:** Reads cart from cookies
- **No Caching:** Cart data is personal and changes frequently
- **Runtime:** Edge

#### Data Sources

| Data Source | API Route | Cache | Headers |
|-------------|-----------|-------|---------|
| Cart | `/api/cart` | `cache: 'no-store'` | Includes `cookie` |

#### Implementation

```typescript
const h = headers();
const cookie = (await h).get('cookie') ?? '';
const res = await fetch(`${base}/${locale}/api/cart`, {
  cache: 'no-store',
  headers: { cookie },
});
```

#### Why No Caching?

- **User-Specific:** Each user has different cart contents
- **Frequent Changes:** Add/remove items, quantity updates
- **Cookie Dependency:** Reading cookies opts out of static optimization
- **Security:** Cart data should not be shared between users

#### Vercel Deployment

- **Build Output:** No pre-rendered pages
- **Edge Caching:** **Completely disabled**
- **CDN Behavior:** `Cache-Control: private, no-cache, no-store`
- **Execution:** Edge runtime for low latency
- **Session Handling:** Cookie-based cart ID passed to backend

---

## Cache Tags & Revalidation

### Cache Tag Strategy

All cache tags follow the pattern: `resource:identifier:locale`

**Example tags:**
```
cms:home:de-DE
cms:home:en-GB
products:de-DE
product:abc123:en-GB
plp:cat:shoes:de-DE
cms:categories:electronics:en-GB
categories:de-DE
```

### Tag Structure

**Defined in:** `lib/cache/tags.ts`

```typescript
// Product tags
productTags.all(locale)              // products:de-DE
productTags.byId(id, locale)         // product:123:de-DE

// Category tags
categoryTags.all(locale)             // categories:de-DE
categoryTags.plp(slug, locale)       // plp:cat:shoes:de-DE
categoryTags.bySlug(slug, locale)    // category:shoes:de-DE

// CMS tags
cmsTags.home(locale)                 // cms:home:de-DE
cmsTags.category(slug, locale)       // cms:categories:shoes:de-DE
```

### On-Demand Revalidation

#### Webhook Endpoints

| Webhook | Endpoint | Trigger | Revalidates |
|---------|----------|---------|-------------|
| CMS Home | `/api/webhooks/cms/revalidate/home` | Contentful publish | `cms:home:{locale}` for all locales |
| CMS Category | `/api/webhooks/cms/revalidate/categories` | Contentful publish | `cms:categories:{slug}:{locale}` |
| CommerceTools | `/api/webhooks/ct/revalidate` | Product/Category change | Product & category tags |

#### Example: CMS Home Revalidation

```typescript
// app/api/webhooks/cms/revalidate/home/route.ts
import { revalidateTag } from 'next/cache';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales';

export async function POST(request: NextRequest) {
  // Authenticate webhook...

  // Revalidate for all locales
  const tags = new Set<string>();
  for (const locale of SUPPORTED_LOCALES) {
    const tag = `cms:home:${locale}`;
    revalidateTag(tag);
    tags.add(tag);
  }

  return NextResponse.json({
    ok: true,
    revalidated: Array.from(tags)
  });
}
```

#### How It Works

1. Content editor publishes changes in Contentful
2. Contentful webhook fires to `/api/webhooks/cms/revalidate/home`
3. Endpoint authenticates request (Bearer token)
4. `revalidateTag()` marks cache entries with matching tags as stale
5. Next request triggers background regeneration
6. Fresh content served immediately after regeneration

---

## Vercel Platform Integration

### Deployment Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Vercel Edge Network                   │
│                  (100+ Global Locations)                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │ Static Pages │  │ ISR Cache    │  │ Edge Runtime │   │
│   │              │  │              │  │              │   │
│   │ • Home       │  │ • Home       │  │ • PDP        │   │
│   │ • Category   │  │ • Category   │  │ • Cart       │   │
│   └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│              Vercel Serverless Functions                 │
│                (Background Revalidation)                 │
└──────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    External Services                     │
│  • CommerceTools API  • Contentful CMS                   │
└──────────────────────────────────────────────────────────┘
```

### Cache Hierarchy

1. **Edge Cache (L1)** - Vercel's global CDN
   - Serves cached responses from nearest edge location
   - ISR pages: Cached for `revalidate` duration
   - Dynamic pages: Bypassed

2. **Data Cache (L2)** - Next.js fetch cache
   - Individual `fetch()` requests cached
   - Tagged for selective invalidation
   - Shared across all functions

3. **Full Route Cache** - Pre-rendered pages
   - Built at deploy time
   - ISR regenerates in background
   - Stored in Vercel's distributed cache

### Edge vs Node.js Runtime

| Feature | Edge Runtime | Node.js Runtime |
|---------|--------------|-----------------|
| **Execution Location** | Edge (100+ locations) | Regional (single region) |
| **Cold Start** | ~10ms | ~100-500ms |
| **Ideal For** | Dynamic, low-latency | ISR, complex computations |
| **API Size Limit** | 1 MB response | 4.5 MB response |
| **Used By** | PDP, Cart | Home, PLP |

### Cache-Control Headers

Vercel respects and enhances Next.js cache directives:

#### ISR Pages (Home, PLP)
```http
Cache-Control: s-maxage=300, stale-while-revalidate=60
CDN-Cache-Control: public, s-maxage=300
Vercel-Cache: HIT
```

#### Dynamic Pages (PDP, Cart)
```http
Cache-Control: private, no-cache, no-store, must-revalidate
Vercel-Cache: BYPASS
```

### Regional Cache Behavior

- **ISR Content:** Cached at edge, regenerated in origin region
- **Edge Functions:** Execute closest to user
- **Revalidation:** Propagates to all edge locations within seconds

### Performance Metrics

Based on typical Vercel deployment:

| Page | TTFB (Edge) | TTFB (Far Region) | Cache Hit Rate |
|------|-------------|-------------------|----------------|
| Home (ISR) | 50-150ms | 100-250ms | ~95% (API cache) |
| PLP (ISR) | 50-150ms | 100-250ms | ~90% (API cache) |
| PDP (Edge) | 50-150ms | 100-250ms | ~90% (API cache) |
| Cart (Edge) | 100-300ms | 150-400ms | 0% (no cache) |

---

## Cache Configuration Reference

### Centralized Configuration

**File:** `lib/config/cache.ts`

```typescript
export const CACHE_REVALIDATION = {
  HOME: 300,       // 5 minutes
  CATEGORY: 600,   // 10 minutes
  LAYOUT: 3600,    // 1 hour
  PRODUCTS: 300,   // 5 minutes
  CATEGORIES: 3600,// 1 hour
} as const;
```

⚠️ **Important:** These constants are for reference and API routes only. Page-level `revalidate` exports must use literal values due to Next.js build-time requirements.

### Usage in Pages

```typescript
// ✅ CORRECT: Literal value with comment
// Cache revalidation: 5 minutes (see lib/config/cache.ts)
export const revalidate = 300;

// ❌ WRONG: Imported constant (breaks build)
import { CACHE_REVALIDATION } from '@/lib/config/cache';
export const revalidate = CACHE_REVALIDATION.HOME;
```

### Usage in API Routes

```typescript
// ✅ CORRECT: Can use constants
import { unstable_cache as cache } from 'next/cache';
import { CACHE_REVALIDATION } from '@/lib/config/cache';

const cached = cache(fetchFn, ['key'], {
  revalidate: CACHE_REVALIDATION.HOME,
  tags: ['cms:home:de-DE']
});
```

---

## Best Practices

### 1. Choose the Right Strategy

- **Use ISR** for content that changes occasionally (home, categories)
- **Use Edge + no-cache** for real-time data (pricing, cart)
- **Use longer revalidation** for stable data (navigation, categories)
- **Use shorter revalidation** for frequently updated content (home, products)

### 2. Implement Granular Cache Tags

```typescript
// ✅ GOOD: Specific tag
tags: [`plp:cat:shoes:de-DE`]

// ❌ BAD: Too broad
tags: [`products`]
```

### 3. Locale-Aware Caching

Always include locale in cache tags:

```typescript
// ✅ CORRECT
tags: [`cms:home:${locale}`]

// ❌ WRONG: Shared across locales
tags: [`cms:home`]
```

### 4. Webhook Authentication

Always authenticate webhook requests:

```typescript
const authz = request.headers.get('authorization') || '';
const expected = process.env.WEBHOOK_SECRET?.trim();

if (!expected || authz !== `Bearer ${expected}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 5. Monitor Cache Performance

Use Vercel Analytics to track:
- Cache hit rates
- TTFB (Time to First Byte)
- Edge vs origin requests
- Revalidation frequency

### 6. Test Revalidation

```bash
# Trigger webhook locally
curl -X POST http://localhost:3000/api/webhooks/cms/revalidate/home \
  -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json"
```

---

## Summary

| Page Type | Strategy | Revalidate | Runtime | Cache Tags | User-Specific |
|-----------|----------|------------|---------|------------|---------------|
| **Home** | ISR | 5 min | Node.js | `cms:home:{locale}`, `products:{locale}` | No |
| **PLP** | ISR | 10 min | Node.js | `plp:cat:{slug}:{locale}` | No |
| **PDP** | Dynamic | 0 (no cache) | Edge | None | No |
| **Cart** | Dynamic | 0 (no cache) | Edge | None | Yes |

This architecture provides:
- ⚡ **Fast performance** via edge caching and ISR
- 🔄 **Fresh content** via webhook-triggered revalidation
- 🌍 **Global scale** via Vercel's edge network
- 🎯 **Precision** via granular cache tags
- 💰 **Cost efficiency** via static generation where possible
