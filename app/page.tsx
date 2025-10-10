import { headers } from 'next/headers';
import Hero from '@/components/Hero';
import ProductSlider from '@/components/ProductSlider';
import { CategoryTiles } from '@/components/CategoryTiles';
import type { ProductDTO } from '@/lib/ct/dto/product';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import { fetchCategoryContentFromCMS } from '@/lib/contentful/category';

export const dynamic = 'force-dynamic';

async function fetchHome(): Promise<import('@/lib/contentful/dto/home').HomeDTO | null> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  const preview = process.env.CONTENTFUL_PREVIEW_ENABLED === 'true' ? '1' : '0';

  const res = await fetch(`${base}/api/cms/home`, {
    headers: { 'x-preview': preview },
    next: { tags: ['cms:home'] },
  });
  if (!res.ok) return null;
  return res.json();
}

interface ListResponse {
  items: ProductDTO[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchRecommended(limit = 4): Promise<ProductDTO[]> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  const res = await fetch(`${base}/api/products?limit=${limit}`, { next: { tags: ['products'] } });
  if (!res.ok) return [];
  const data = (await res.json()) as ListResponse;
  return data.items;
}

function flattenCategories(categories: CategoryDTO[]): CategoryDTO[] {
  const flat: CategoryDTO[] = [];
  categories.forEach(c => {
    flat.push(c);
    if (c.children) {
      flat.push(...flattenCategories(c.children));
    }
  });
  return flat;
}

async function fetchCategories(featuredSlugs?: string[], sliced: number = 4): Promise<CategoryDTO[]> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  const res = await fetch(`${base}/api/categories`, { next: { tags: ['categories'] } });
  if (!res.ok) return [];
  const data = (await res.json()) as { items: CategoryDTO[] };
  const items = await data.items;

  const flat = flattenCategories(items);
  if (sliced <= 0) sliced = 8;
  const chosen = featuredSlugs && featuredSlugs.length
    ? flat.filter(c => featuredSlugs.includes(c.slug))
    : flat.slice(0, sliced);

  // Enrich categories with content from CMS
  const enriched: CategoryDTO[] = [];
  for (const c of chosen) {
    // Fetch category content from CMS to enrich the category data
    await fetchCategoryContentFromCMS(c.slug).then(content => {
      if (content) {
        console.log(`Enriched category ${c.slug} with CMS content`);
        console.log(content);
        c.content = content;
      }
      enriched.push(c);
    }).catch(() => {
      // Ignore errors and keep existing category data
    });
  };
  return enriched;
}

export default async function HomePage() {
  const home = await fetchHome();
  const recommendedItems = await fetchRecommended();

  return (
    <main className="min-h-screen">
      <Hero
        title={home?.hero.title ?? 'Composable Storefront on Vercel'}
        subtitle={home?.hero.subtitle}
        ctaText={home?.hero.ctaText}
        ctaLink={home?.hero.ctaLink}
        imageUrl={home?.hero.imageUrl}
      />
      <CategoryTiles
        heading={home?.showcaseHeading}
        categories={await fetchCategories(home?.featuredCategorySlugs, 8)}
      />
      <ProductSlider items={recommendedItems} heading={home?.recommendedHeading} />
    </main>
  );
}
