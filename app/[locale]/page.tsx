import Hero from '@/components/Hero';
import ProductSlider from '@/components/ProductSlider';
import { CategoryTiles } from '@/components/CategoryTiles';
import type { ProductDTO } from '@/lib/ct/dto/product';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import type { CategoryCMSContentDTO } from '@/app/[locale]/api/cms/home/categories/[slug]/route';
import type { HomeDTO } from '@/lib/contentful/dto/home';
import { headers } from 'next/headers';
import { localeToCurrency, localeToCountry, SupportedLocale } from '@/lib/i18n/locales';

export const revalidate = 300;

type Params = { locale: SupportedLocale };
type ListResponse = { items: ProductDTO[]; total: number; limit: number; offset: number };

async function fetchHome(locale: SupportedLocale): Promise<HomeDTO | null> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  
  const res = await fetch(`${base}/${locale}/api/cms/home`, {
    next: { revalidate, tags: [`cms:home:${locale}`] },
  });
  if (!res.ok) return null;
  return res.json() as Promise<HomeDTO>;
}

async function fetchCategoryContentFromCMS(locale: SupportedLocale, slug: string): Promise<CategoryCMSContentDTO | null> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  
  const res = await fetch(`${base}/${locale}/api/cms/home/categories/${slug}`, {
    next: { tags: [`categories:${locale}`] },
  });
  if (!res.ok) return null;
  return res.json() as Promise<CategoryCMSContentDTO>;
}

function flattenCategories(categories?: CategoryDTO[] | null): CategoryDTO[] {
  if (!Array.isArray(categories)) return [];
  const out: CategoryDTO[] = [];
  for (const raw of categories) {
    // Normalize node shape
    const node: CategoryDTO = {
      ...raw,
      children: Array.isArray(raw?.children) ? raw.children : [],
    };
    out.push(node);
    if (node.children.length) {
      out.push(...flattenCategories(node.children));
    }
  }
  return out;
}

async function fetchCategories(locale: SupportedLocale, featuredSlugs?: string[], sliced = 8): Promise<CategoryDTO[]> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  
  const res = await fetch(`${base}/${locale}/api/categories`, {
    next: { revalidate: 3600, tags: [`categories:${locale}`] },
  });
  if (!res.ok) return [];
  const payload = await res.json();
    const items: CategoryDTO[] = Array.isArray(payload?.items)
      ? (payload.items as CategoryDTO[])
      : Array.isArray(payload)
      ? (payload as CategoryDTO[])
      : [];

    const flat = flattenCategories(items);

    const chosen =
      featuredSlugs?.length
        ? flat.filter((c) => featuredSlugs.includes(c.slug))
        : flat.slice(0, Math.max(1, sliced));

  // Enrich in parallel
  const enriched = await Promise.all(
    chosen.map(async (c) => {
      const content = await fetchCategoryContentFromCMS(locale, c.slug).catch(() => null);
      return content ? { ...c, content } : c;
    })
  );
  return enriched;
}

async function fetchRecommended(locale: SupportedLocale, limit = 4): Promise<ProductDTO[]> {
  const h = headers();
  const proto = (await h).get('x-forwarded-proto') ?? 'http';
  const host = (await h).get('host');
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? (host ? `${proto}://${host}` : '');
  const qs = new URLSearchParams({ limit: `${limit}`, currency: localeToCurrency(locale), country: localeToCountry(locale) }).toString();

  const res = await fetch(`${base}/api/products${qs ? `?${qs}` : ''}`, {
    next: { tags: [`products:${locale}`] },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as ListResponse;
  return data.items;
}

export default async function HomePage({
  params,
}: {
  params: Promise<Params>; // Next 15: await params
}) {
  const { locale } = await params;
  const home = await fetchHome(locale);
  const [recommendedItems, categories] = await Promise.all([
    fetchRecommended(locale),
    fetchCategories(locale, home?.featuredCategorySlugs, 8),
  ]);

  return (
    <main className="min-h-screen">
      <Hero
        title={home?.hero.title ?? 'Composable Storefront on Vercel'}
        subtitle={home?.hero.subtitle}
        ctaText={home?.hero.ctaText}
        ctaLink={home?.hero.ctaLink}
        imageUrl={home?.hero.imageUrl}
      />
      <CategoryTiles heading={home?.showcaseHeading} categories={categories} locale={locale}/>
      <ProductSlider items={recommendedItems} heading={home?.recommendedHeading} locale={locale} />
    </main>
  );
}
