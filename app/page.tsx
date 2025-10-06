import { headers } from 'next/headers';
import Hero from '@/components/Hero';
import CategoryTiles from '@/components/CategoryTiles';
import ProductSlider from '@/components/ProductSlider';

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

export default async function HomePage() {
  const home = await fetchHome();

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
        featuredSlugs={home?.featuredCategorySlugs}
      />
      <ProductSlider heading={home?.recommendedHeading} />
    </main>
  );
}
