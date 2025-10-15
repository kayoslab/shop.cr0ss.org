import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import type { Category } from '@commercetools/platform-sdk';
import { appListCategories, buildCategoryTree } from '@/lib/ct/categories';
import type { CategoryDTO } from '@/lib/ct/dto/category';

async function _fetchCategories(locale: string): Promise<CategoryDTO[]> {
  const list: Category[] = await appListCategories(200);
  return buildCategoryTree(list, locale);
}

const cached = (locale: 'de-DE'|'en-GB') =>
  cache(_fetchCategories, ['api-categories', locale], {
    tags: [`categories:${locale}`],
    revalidate: 3600,
  }
)(locale);

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ locale: 'de-DE'|'en-GB' }> }
) {
  const { locale } = await ctx.params;
  const data = await cached(locale);

  // Prefer relying on unstable_cache; avoid CDN caching here
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}