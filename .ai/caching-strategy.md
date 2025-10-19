# Caching Strategy

## Centralized Cache Configuration

⚠️ **IMPORTANT:** Next.js segment config exports MUST be literal values, not imported constants.

❌ **WRONG - This breaks builds:**
```typescript
import { CACHE_REVALIDATION } from '@/lib/config/cache';
export const revalidate = CACHE_REVALIDATION.HOME; // ❌ Build error
```

✅ **CORRECT - Use literal values with reference comment:**
```typescript
// Cache revalidation: 5 minutes (see lib/config/cache.ts for values)
export const revalidate = 300;
```

### Standard Cache Durations

Reference `lib/config/cache.ts` for the source of truth, but use literal values in pages:

```typescript
// lib/config/cache.ts (reference only - DO NOT import in pages)
export const CACHE_REVALIDATION = {
  HOME: 300,       // 5 minutes
  CATEGORY: 600,   // 10 minutes
  LAYOUT: 3600,    // 1 hour
  PRODUCTS: 300,   // 5 minutes
  CATEGORIES: 3600,// 1 hour
} as const;
```

✅ **In page/layout files, use literal values with comments:**

```typescript
// app/[locale]/page.tsx
// Cache revalidation: 5 minutes (see lib/config/cache.ts)
export const revalidate = 300;

// app/[locale]/layout.tsx
// Cache revalidation: 1 hour (see lib/config/cache.ts)
export const revalidate = 3600;
```

⚠️ **Note:** `CACHE_REVALIDATION` constants CAN be used in API routes and `unstable_cache` calls, just not in segment config exports.

## ISR (Incremental Static Regeneration) Pattern

### Page-Level ISR

✅ **PATTERN for cacheable pages:**

```typescript
import { CACHE_REVALIDATION } from '@/lib/config/cache';

export const revalidate = CACHE_REVALIDATION.HOME;

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  // Fetch data with matching revalidation
  const data = await fetch(url, {
    next: {
      revalidate: CACHE_REVALIDATION.HOME,
      tags: [`cms:home:${locale}`]
    }
  });

  return <div>{/* render */}</div>;
}
```

### API Route Caching

✅ **PATTERN with unstable_cache:**

```typescript
import { unstable_cache as cache } from 'next/cache';
import { CACHE_REVALIDATION } from '@/lib/config/cache';

async function _fetchData(locale: SupportedLocale): Promise<DataDTO[]> {
  // Expensive data fetching
  return data;
}

const cachedFetch = (locale: SupportedLocale) =>
  cache(_fetchData, ['cache-key', locale], {
    tags: [dataTags.all(locale)],
    revalidate: CACHE_REVALIDATION.PRODUCTS,
  })(locale);

export async function GET(req: NextRequest, ctx: Context) {
  const { locale } = await ctx.params;
  const data = await cachedFetch(locale);

  // Let unstable_cache handle caching; keep HTTP response non-cacheable
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'no-store' }
  });
}
```

## Cache Tags

### Locale-Specific Tags

✅ **MUST** include locale in cache tags:

```typescript
import { productTags, categoryTags, cmsTags } from '@/lib/cache/tags';

// Product tags
productTags.all(locale)              // 'products:de-DE'
productTags.byId(id, locale)         // 'product:123:de-DE'

// Category tags
categoryTags.all(locale)             // 'categories:de-DE'
categoryTags.bySlug(slug, locale)    // 'plp:cat:shoes:de-DE'

// CMS tags
cmsTags.home(locale)                 // 'cms:home:de-DE'
cmsTags.category(slug, locale)       // 'cms:categories:shoes:de-DE'
```

### Tag Naming Convention

✅ **PATTERN:**
```
{source}:{type}:{identifier}:{locale}

Examples:
- products:de-DE
- product:abc123:de-DE
- plp:cat:electronics:en-GB
- cms:home:de-DE
- categories:en-GB
```

## Dynamic vs. Static Routes

### When to Use Dynamic (no-store)

✅ **USE `cache: 'no-store'` FOR:**
- Real-time pricing (PDP)
- Cart operations
- User-specific data
- Stock availability

```typescript
// PDP with real-time data
export const runtime = 'edge';
export const revalidate = 0;

async function fetchProduct(id: string, locale: SupportedLocale) {
  return fetch(url, { cache: 'no-store' });
}
```

### When to Use ISR

✅ **USE ISR FOR:**
- Home page
- Category pages (PLP)
- Navigation
- CMS content
- Product lists

```typescript
export const revalidate = CACHE_REVALIDATION.CATEGORY;

async function fetchCategoryProducts(slug: string, locale: SupportedLocale) {
  return fetch(url, {
    next: {
      revalidate: CACHE_REVALIDATION.CATEGORY,
      tags: [`plp:cat:${slug}:${locale}`]
    }
  });
}
```

## On-Demand Revalidation

### Webhook-Triggered Revalidation

✅ **PATTERN:**

```typescript
import { revalidateTag } from 'next/cache';

export async function POST(request: NextRequest) {
  // Authenticate webhook
  // ...

  const body = await request.json();
  const revalidatedTags = new Set<string>();

  for (const locale of SUPPORTED_LOCALES) {
    const tag = `cms:home:${locale}`;
    revalidateTag(tag);
    revalidatedTags.add(tag);
  }

  return NextResponse.json({
    ok: true,
    revalidated: Array.from(revalidatedTags)
  });
}
```

## Cache Keys

### Composition

✅ **MUST** include all variables affecting the response:

```typescript
cache(_fetchProducts, [
  'api-products',       // Base key
  qsString,             // Query parameters
  locale,               // Locale
  currency,             // Currency
  country               // Country
], {
  tags: [productTags.all(locale)],
  revalidate: CACHE_REVALIDATION.PRODUCTS,
})(qsString, locale, currency, country);
```

### Key Ordering

✅ **CONSISTENT ORDER:**
1. Function/route identifier
2. Variable parameters (in consistent order)
3. Locale (always at or near end)

## HTTP Cache Headers

### Cookie-Free APIs

✅ **PATTERN for cacheable APIs:**

```typescript
// Let unstable_cache handle caching
return NextResponse.json(data, {
  headers: { 'Cache-Control': 'no-store' }
});

// OR with CDN caching
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
    'Vary': 'accept-encoding, x-preview',
  },
});
```

❌ **AVOID** CDN caching for dynamic routes:

```typescript
// BAD for user-specific data
return NextResponse.json(userData, {
  headers: { 'Cache-Control': 'public, max-age=3600' }
});
```

## Edge vs. Node Runtime

### Edge Runtime

✅ **USE EDGE FOR:**
- Product detail pages (real-time pricing)
- Cart operations
- Low-latency requirements

```typescript
export const runtime = 'edge';
export const revalidate = 0;
```

### Node Runtime (Default)

✅ **USE NODE FOR:**
- ISR pages
- API routes with caching
- Routes using Node.js-specific features

```typescript
// Default runtime, no need to specify
export const revalidate = CACHE_REVALIDATION.CATEGORY;
```

## Cache Invalidation Strategy

### Granular Invalidation

✅ **PREFER** specific tags over broad invalidation:

```typescript
// GOOD - Invalidate only affected category
revalidateTag(`plp:cat:${slug}:${locale}`);

// AVOID - Invalidating everything
revalidateTag(`categories:${locale}`);
```

### Multi-Locale Invalidation

✅ **PATTERN for content changes affecting all locales:**

```typescript
for (const locale of SUPPORTED_LOCALES) {
  revalidateTag(`cms:home:${locale}`);
  revalidatedTags.add(`cms:home:${locale}`);
}
```

## Preventing Cookie-Based Cache Coupling

❌ **NEVER** read cookies in cacheable routes:

```typescript
// BAD - Breaks caching
export async function GET(req: NextRequest) {
  const userId = req.cookies.get('userId'); // ❌
  const data = await fetchUserData(userId);
  return NextResponse.json(data);
}
```

✅ **USE** URL parameters for context:

```typescript
// GOOD - Cache-friendly
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const currency = url.searchParams.get('currency'); // ✅
  const data = await fetchData(currency);
  return NextResponse.json(data);
}
```
