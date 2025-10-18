import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import type { Category } from '@commercetools/platform-sdk';
import { appListCategories, buildCategoryTree } from '@/lib/ct/categories';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import { SupportedLocale, validateLocale, isSupportedLocale } from '@/lib/i18n/locales';
import { categoryTags } from '@/lib/cache/tags';

async function _fetchCategories(locale: SupportedLocale): Promise<CategoryDTO[]> {
  const list: Category[] = await appListCategories(200);
  return buildCategoryTree(list, locale);
}

const cached = (locale: SupportedLocale) =>
  cache(_fetchCategories, ['api-categories', locale], {
    tags: [categoryTags.all(locale)],
    revalidate: 3600,
  })(locale);

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ locale: string }> }
) {
  const { locale } = await ctx.params;

  if (!isSupportedLocale(locale)) {
    return new NextResponse('Locale not supported', { status: 400 });
  }

  const data = await cached(locale);

  // Prefer relying on unstable_cache; avoid CDN caching here
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}