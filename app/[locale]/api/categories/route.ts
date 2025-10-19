import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import type { Category } from '@commercetools/platform-sdk';
import { appListCategories, buildCategoryTree } from '@/lib/ct/categories';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import { SupportedLocale, isSupportedLocale } from '@/lib/i18n/locales';
import { categoryTags } from '@/lib/cache/tags';
import { ErrorResponses } from '@/lib/utils/apiErrors';
import { CACHE_REVALIDATION } from '@/lib/config/cache';

async function _fetchCategories(locale: SupportedLocale): Promise<CategoryDTO[]> {
  const list: Category[] = await appListCategories(200);
  return buildCategoryTree(list, locale);
}

const cached = (locale: SupportedLocale) =>
  cache(_fetchCategories, ['api-categories', locale], {
    tags: [categoryTags.all(locale)],
    revalidate: CACHE_REVALIDATION.CATEGORIES,
  })(locale);

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ locale: string }> }
) {
  const { locale } = await ctx.params;

  if (!isSupportedLocale(locale)) {
    return ErrorResponses.localeNotSupported();
  }

  const data = await cached(locale);

  // Prefer relying on unstable_cache; avoid CDN caching here
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}