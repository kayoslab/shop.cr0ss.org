# Next.js 15 Patterns

## Async Params and SearchParams

Next.js 15 requires `params` and `searchParams` to be awaited as Promises.

### Page Components

✅ **REQUIRED PATTERN:**
```typescript
export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  // ... rest of component
}
```

❌ **WRONG (Next.js 14 pattern):**
```typescript
export default async function ProductPage({
  params,
}: {
  params: { locale: string; id: string };
}) {
  const { locale, id } = params; // Missing await
}
```

### Route Handlers (API Routes)

✅ **REQUIRED PATTERN:**
```typescript
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ locale: string }> }
) {
  const { locale } = await ctx.params;
  // ... rest of handler
}
```

## Server vs Client Components

### Default to Server Components

- ✅ **DEFAULT:** All components are Server Components unless marked with `'use client'`
- ✅ **USE SERVER:** For data fetching, accessing backend resources, keeping sensitive info on server
- ✅ **USE CLIENT:** Only when you need interactivity, event listeners, hooks, or browser APIs

### Client Component Boundaries

❌ **BAD (too much on client):**
```typescript
'use client';
import { getProducts } from '@/lib/api';

export default function ProductPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return <div>{/* render products */}</div>;
}
```

✅ **GOOD (server fetches, client renders interactive parts):**
```typescript
// app/products/page.tsx (Server Component)
export default async function ProductPage() {
  const products = await getProducts();
  return <ProductList products={products} />;
}

// components/ProductList.tsx (Client Component for interactivity)
'use client';
export function ProductList({ products }: { products: ProductDTO[] }) {
  const [filter, setFilter] = useState('');
  // ... interactive logic
}
```

## Route Segment Config

### Revalidation

⚠️ **CRITICAL:** Segment config exports MUST be literal values, not imported constants.

❌ **WRONG - Breaks Build:**
```typescript
import { CACHE_REVALIDATION } from '@/lib/config/cache';
export const revalidate = CACHE_REVALIDATION.HOME; // ❌ Build fails
```

✅ **CORRECT - Use literal values:**
```typescript
// Cache revalidation: 5 minutes (see lib/config/cache.ts for standard values)
export const revalidate = 300;
```

**Standard values** (reference `lib/config/cache.ts`):
- `300` - 5 minutes (home, products)
- `600` - 10 minutes (category pages)
- `3600` - 1 hour (layout, navigation)
- `0` - No caching (PDP, cart)

### Runtime

- ✅ **USE** `edge` runtime for latency-sensitive routes (PDP, cart)
- ✅ **USE** default Node.js runtime for routes needing full Node.js features

```typescript
// For PDP with real-time pricing
export const runtime = 'edge';
export const revalidate = 0;
```

## Caching Strategy

### Fetch with Cache Options

✅ **PATTERN for ISR pages:**
```typescript
const res = await fetch(url, {
  next: {
    revalidate: CACHE_REVALIDATION.HOME,
    tags: [`cms:home:${locale}`]
  }
});
```

✅ **PATTERN for dynamic data:**
```typescript
const res = await fetch(url, {
  cache: 'no-store'
});
```

### unstable_cache Usage

✅ **REQUIRED PATTERN:**
```typescript
import { unstable_cache as cache } from 'next/cache';
import { CACHE_REVALIDATION } from '@/lib/config/cache';

const cached = (locale: SupportedLocale) =>
  cache(_fetchData, ['cache-key', locale], {
    tags: [cacheTags.all(locale)],
    revalidate: CACHE_REVALIDATION.PRODUCTS,
  })(locale);
```

## Image Optimization

✅ **REQUIRED:**
- Use `next/image` for all images
- Define `sizes` prop for responsive images
- Use `priority={true}` only for above-the-fold images

```typescript
<Image
  src={imageUrl}
  alt={description}
  fill
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
  className="object-cover"
  priority={false}
/>
```

## Locale Routing

- ✅ **MUST** use `[locale]` segment for i18n routes
- ✅ **MUST** validate locale using `isSupportedLocale()` type guard
- ✅ **MUST** use locale-specific cache tags

```typescript
const { locale } = await params;

if (!isSupportedLocale(locale)) {
  return ErrorResponses.localeNotSupported();
}
```

## Metadata

✅ **PREFER** `generateMetadata` for dynamic metadata:
```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await getProduct(id, locale);

  return {
    title: product.name,
    description: product.description,
  };
}
```

## Error and Loading States

- ✅ **MUST** provide `error.tsx` for error boundaries
- ✅ **MUST** provide `loading.tsx` for loading states
- ✅ **MUST** use shared components from `components/ErrorBoundary.tsx` and `components/LoadingState.tsx`

```typescript
// app/[locale]/products/error.tsx
'use client';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundary error={error} reset={reset} />;
}
```
