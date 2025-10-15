import type { Asset, AssetFile } from 'contentful';
import { contentfulClient } from './client';
import type { HomeDTO } from './dto/home';
import { DEFAULT_LOCALE } from '../i18n/locales';

type HomeFields = {
    contentTypeId: string;
    fields: {
        internalName?: string;
        heroTitle?: string;
        heroSubtitle?: string;
        heroCtaText?: string;
        heroCtaLink?: string;
        heroImage?: Asset;
        featuredCategorySlugs?: string[];
        recommendedHeading?: string;
        showcaseHeading?: string;
    };
};

function assetUrl(asset: Asset, locale: string): string | undefined {
  let file: AssetFile | undefined;
  const fileField = asset?.fields?.file;
  if (fileField && typeof fileField === 'object' && !('url' in fileField)) {
    file = (fileField as { [x: string]: AssetFile | undefined })[locale] 
        ?? (fileField as { [x: string]: AssetFile | undefined })[DEFAULT_LOCALE];
  } else {
    file = fileField as AssetFile | undefined;
  }
  const url = file?.url || file?.['url'];
  if (!url) return undefined;
  return url.startsWith('//') ? `https:${url}` : url;
}

export async function fetchHomeFromCMS(locale = DEFAULT_LOCALE, preview = false): Promise<HomeDTO | null> {
  const cf = contentfulClient(preview);
  const res = await cf.getEntries<HomeFields>({
    content_type: 'homepage',
    limit: 1,
    include: 1,
    locale,
  });

  if (!res.items?.length) return null;
  const entry = res.items[0];
  const f = entry.fields || {};

  const heroImageUrl = f.heroImage ? assetUrl(f.heroImage, locale) : undefined;

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
