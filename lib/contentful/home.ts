import { contentfulClient } from './client';
import type { HomeDTO } from './dto/home';
import { DEFAULT_LOCALE } from '../i18n/locales';
import { type HomepageSkeleton, CONTENT_TYPE_IDS, getAssetUrl } from './types';

export async function fetchHomeFromCMS(locale = DEFAULT_LOCALE, preview = false): Promise<HomeDTO | null> {
  const cf = contentfulClient(preview);
  const res = await cf.getEntries<HomepageSkeleton>({
    content_type: CONTENT_TYPE_IDS.HOMEPAGE,
    limit: 1,
    include: 1,
    locale,
  });

  if (!res.items?.length) return null;
  const entry = res.items[0];
  const f = entry.fields;

  const heroImageUrl = f.heroImage ? getAssetUrl(f.heroImage, locale, DEFAULT_LOCALE) : undefined;

  return {
    hero: {
      title: f.heroTitle ?? 'Composable Storefront on Vercel',
      subtitle: f.heroSubtitle ?? 'Fast, fresh, and headless—powered by Next.js, Edge, and commercetools.',
      ctaText: f.heroCtaText ?? 'Shop Products',
      ctaLink: f.heroCtaLink ?? '/products',
      imageUrl: heroImageUrl,
    },
    featuredCategorySlugs: f.featuredCategorySlugs ?? [],
    recommendedHeading: f.recommendedHeading ?? 'Recommended',
    showcaseHeading: f.showcaseHeading ?? 'Shop by Category',
  };
}
