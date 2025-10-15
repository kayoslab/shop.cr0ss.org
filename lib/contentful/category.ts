import type { Asset, AssetFile } from 'contentful';
import { contentfulClient } from './client';
import type { CategoryContentDTO } from './dto/category';
import { DEFAULT_LOCALE } from '../i18n/locales';

type CategoryFields = {
    contentTypeId: string;
    fields: {
        slug: string;
        excerpt: string;
        description: string;
        imageUrl?: string;
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

export async function fetchCategoryContentFromCMS(
    slug: string,
    locale = DEFAULT_LOCALE, 
    preview = false
): Promise<CategoryContentDTO | null> {
  const cf = contentfulClient(preview);
  const tempVar = { 
    content_type: 'category',
    'fields.slug': slug,
    limit: 1,
    include: 1,
    locale,
  };

  const res = await cf.getEntries<CategoryFields>(tempVar);

  if (!res.items?.length) return null;
  const entry = res.items[0];
  const f = entry.fields || {};
  const heroImageUrl = f.imageUrl ? assetUrl(f.imageUrl, locale) : undefined;

  return {
    slug: f.slug ?? 'category',
    excerpt: f.excerpt ?? 'Exciting new products.',
    description: f.description ?? '',
    imageUrl: heroImageUrl,
  };
}
