import { NextResponse, type NextRequest } from 'next/server';
import { unstable_cache as cache } from 'next/cache';
import type { Category } from '@commercetools/platform-sdk';
import { appListCategories, buildCategoryTree } from '@/lib/ct/categories';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import { cookies } from 'next/headers';

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
  const c = cookies();
  const cookieLocale = ((await c).get('locale')?.value ?? process.env.DEMO_DEFAULT_LOCALE ?? 'en-GB') as 'de-DE' | 'en-GB';
  
  const data = await cachedFetchCategories(cookieLocale);

  return NextResponse.json(
    { items: data },
    { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=60' } }
  );
}
