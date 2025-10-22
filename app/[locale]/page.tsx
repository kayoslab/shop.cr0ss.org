import { Hero } from '@/components/Hero';
import { ProductSlider } from '@/components/ProductSlider';
import { CategoryTiles } from '@/components/CategoryTiles';
import { SupportedLocale, SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import {
  fetchHomeData,
  fetchCategoriesData,
  fetchRecommendedProducts,
} from '@/lib/helpers/homeData';

// Cache revalidation: 5 minutes (see lib/config/cache.ts for values)
export const revalidate = 300;

/**
 * Pre-render home page for all supported locales at build time
 * This enables ISR with proper cache headers (max-age=30) instead of dynamic rendering
 */
export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
  }));
}

type Params = { locale: SupportedLocale };

export default async function HomePage({
  params,
}: {
  params: Promise<Params>; // Next 15: await params
}) {
  const { locale } = await params;
  const home = await fetchHomeData(locale);
  const [recommendedItems, categories] = await Promise.all([
    fetchRecommendedProducts(locale),
    fetchCategoriesData(locale, home?.featuredCategorySlugs, 8),
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
