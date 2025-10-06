import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import type { Category } from '@commercetools/platform-sdk';
import { appListCategories, buildCategoryTree } from '@/lib/ct/categories';
import type { CategoryDTO } from '@/lib/ct/dto/category';

async function _fetchCategories(locale: string): Promise<CategoryDTO[]> {
  const list: Category[] = await appListCategories(200);
  return buildCategoryTree(list, locale);
}

const cachedFetchCategories = (locale: string) =>
  cache(_fetchCategories, ['api-categories', locale], {
    tags: ['categories'],
    revalidate: 60 * 10,
  })(locale);

export async function GET(request: NextRequest) {
  const locale = request.headers.get('x-locale') ?? process.env.DEMO_DEFAULT_LOCALE ?? 'de-DE';
  const data = await cachedFetchCategories(locale);

  return NextResponse.json(
    { items: data },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=60' } }
  );
}
