# Component Guidelines

## Server vs Client Components

### Default: Server Components

✅ **ALWAYS** default to Server Components unless interactivity is required

**Server Components are for:**
- Data fetching
- Accessing backend resources
- Keeping sensitive information on server
- Reducing client JavaScript bundle

**Client Components are for:**
- Event handlers (`onClick`, `onChange`, etc.)
- React hooks (`useState`, `useEffect`, etc.)
- Browser-only APIs
- Class components (rare)

### Client Component Marking

✅ **REQUIRED:** Mark client components with `'use client'` directive:

```typescript
'use client';

import { useState } from 'react';

export function ProductFilter({ products }: { products: ProductDTO[] }) {
  const [filter, setFilter] = useState('');
  // ... interactive logic
}
```

### Minimize Client Component Boundaries

✅ **PATTERN - Push client components to the leaves:**

```typescript
// ❌ BAD - Entire page is client component
'use client';
export default function ProductPage() {
  const [sort, setSort] = useState('price');
  return (
    <div>
      <h1>Products</h1>
      <ProductList sort={sort} />
      <SortControls value={sort} onChange={setSort} />
    </div>
  );
}

// ✅ GOOD - Only interactive parts are client components
export default async function ProductPage() {
  const products = await fetchProducts(); // Server-side data fetching
  return (
    <div>
      <h1>Products</h1>
      <ProductListClient products={products} /> {/* Client component */}
    </div>
  );
}
```

## Component Naming

### File Names

✅ **REQUIRED:**
- PascalCase for all React component files
- Descriptive names indicating purpose
- Suffix with `Client` for client components in Server Component context

```
ProductCard.tsx           ✅
AddToBasketClient.tsx     ✅
CartCountClient.tsx       ✅

product-card.tsx          ❌
addtobasket.tsx           ❌
cart_count.tsx            ❌
```

### Component Names

✅ **MATCH** component name to file name:

```typescript
// File: ProductCard.tsx
export function ProductCard({ product }: ProductCardProps) {
  // ...
}

// File: AddToBasketClient.tsx
'use client';
export default function AddToBasketClient({ product }: Props) {
  // ...
}
```

## Props and TypeScript

### Props Interface

✅ **REQUIRED pattern:**

```typescript
interface ProductCardProps {
  product: ProductDTO;
  locale: SupportedLocale;
  compact?: boolean;
}

export function ProductCard({
  product,
  locale,
  compact = false
}: ProductCardProps) {
  // ...
}
```

### Inline Props (Simple Components)

✅ **ACCEPTABLE for simple components:**

```typescript
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  // ...
}
```

### Children Prop

✅ **PATTERN:**

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-xl border', className)}>
      {children}
    </div>
  );
}
```

## Shared Components

### Location

✅ **PLACE shared components in `components/` root:**

```
components/
├── Card.tsx              # Used across features
├── ErrorBoundary.tsx     # Used globally
├── LoadingState.tsx      # Shared loading states
└── Nav.tsx               # Global navigation
```

### Feature-Specific Components

✅ **PLACE feature components in subdirectories:**

```
components/
├── cart/
│   ├── CartClient.tsx
│   └── CartCountClient.tsx
└── pdp/
    ├── AddToBasketClient.tsx
    └── ProductGalleryClient.tsx
```

## Styling

### Tailwind CSS

✅ **REQUIRED:**
- Use Tailwind utility classes
- Use `clsx` or `cn` utility for conditional classes
- Keep className strings readable

```typescript
import { clsx } from 'clsx';

export function Card({ className, variant = 'default' }: CardProps) {
  return (
    <div className={clsx(
      'rounded-xl border p-4',
      variant === 'elevated' && 'shadow-lg',
      variant === 'outlined' && 'border-2',
      className
    )}>
      {/* content */}
    </div>
  );
}
```

### cn Utility (Tailwind Merge)

✅ **PATTERN from `components/Card.tsx`:**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn('base-classes', conditionalClass && 'conditional', className)} />
```

## Image Components

✅ **REQUIRED - Use next/image:**

```typescript
import Image from 'next/image';
import { PLACEHOLDER_IMAGES } from '@/lib/config/placeholders';

export function ProductImage({ src, alt }: { src?: string; alt: string }) {
  return (
    <Image
      src={src || PLACEHOLDER_IMAGES.PRODUCT}
      alt={alt}
      fill
      className="object-contain"
      sizes="(max-width: 640px) 50vw, 240px"
      priority={false}
    />
  );
}
```

### Image Sizing

✅ **ALWAYS** provide `sizes` prop for responsive images:

```typescript
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
```

### Placeholder Images

✅ **USE** centralized constants:

```typescript
import { PLACEHOLDER_IMAGES } from '@/lib/config/placeholders';

const imageUrl = product.image || PLACEHOLDER_IMAGES.PRODUCT;
```

## Loading and Error States

### Reusable Components

✅ **USE** shared components from `components/LoadingState.tsx`:

```typescript
import { LoadingPage, LoadingSpinner, ProductCardSkeleton } from '@/components/LoadingState';

// Full page loading
export default function Loading() {
  return <LoadingPage />;
}

// Inline spinner
<LoadingSpinner size="lg" />

// Skeleton loader
<ProductCardSkeleton />
```

### Error Boundaries

✅ **USE** shared `ErrorBoundary` component:

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

## Component Composition

### Compound Components

✅ **PATTERN for related components:**

```typescript
// components/Card.tsx
export function Card({ className, children }: CardProps) { /* ... */ }
export function CardHeader({ className, children }: CardHeaderProps) { /* ... */ }
export function CardTitle({ className, children }: CardTitleProps) { /* ... */ }
export function CardContent({ className, children }: CardContentProps) { /* ... */ }

// Usage
import { Card, CardHeader, CardTitle, CardContent } from '@/components/Card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

## Event Handlers

### Naming

✅ **USE** `handle` prefix for event handlers:

```typescript
'use client';

export function ProductFilter() {
  const handleFilterChange = (value: string) => {
    // Handle filter
  };

  const handleReset = () => {
    // Handle reset
  };

  return (
    <div>
      <input onChange={(e) => handleFilterChange(e.target.value)} />
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
```

## Accessibility

### Required Attributes

✅ **ALWAYS** include:
- `alt` text for images
- `aria-label` for icon buttons
- Semantic HTML elements

```typescript
// ✅ Good
<button aria-label="Add to cart" onClick={handleAdd}>
  <CartIcon />
</button>

<Image src={src} alt={product.name} />

// ❌ Bad
<div onClick={handleAdd}>
  <CartIcon />
</div>

<Image src={src} alt="" />
```

## Performance

### Avoid Unnecessary Re-renders

✅ **USE** `React.memo` for expensive components:

```typescript
import { memo } from 'react';

export const ProductCard = memo(function ProductCard({
  product
}: ProductCardProps) {
  // Expensive rendering logic
  return <div>{/* ... */}</div>;
});
```

### useMemo for Expensive Calculations

✅ **PATTERN:**

```typescript
'use client';
import { useMemo } from 'react';

export function ProductList({ products, filter }: Props) {
  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.includes(filter));
  }, [products, filter]);

  return <div>{/* render filteredProducts */}</div>;
}
```

## Data Fetching in Components

### Server Components

✅ **FETCH directly in Server Components:**

```typescript
export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await fetchProduct(id); // Direct async call

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
```

### Client Components

✅ **PASS data as props, don't fetch in client components:**

```typescript
// ❌ BAD - Fetching in client component
'use client';
export function ProductList() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);
  // ...
}

// ✅ GOOD - Receive data as props
'use client';
export function ProductList({ products }: { products: ProductDTO[] }) {
  // Render products
}
```
