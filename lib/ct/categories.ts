import type { Category, CategoryPagedQueryResponse, ProductProjectionPagedQueryResponse } from '@commercetools/platform-sdk';
import { apiRootApp } from './client';
import { categoryRecordToDTO, type CategoryDTO } from './dto/category';
import { DEFAULT_LOCALE, SupportedLocale } from '../i18n/locales';

const esc = (s: string) => s.replaceAll('"', '\\"');

/**
 * Get a Category by its slug (localized).
 */
export async function appGetCategoryBySlug(
  slug: string,
  locale: string
): Promise<Category | null> {
  const where = `slug(${locale}="${esc(slug)}") or slug(${DEFAULT_LOCALE}="${esc(slug)}")`;

  const res = await apiRootApp
    .categories()
    .get({ queryArgs: { where, limit: 1 } })
    .execute();

  const body: CategoryPagedQueryResponse = res.body;
  return body.results?.[0] ?? null;
}
/**
 * List Products filtered by Category ID (uses Products API w/ where predicate).
 */
export async function appListProductsByCategoryId(params: {
  categoryId: string;
  limit?: number;
  offset?: number;
}) {
  const { categoryId, limit = 12, offset = 0 } = params;
  const where = `categories(id="${categoryId}")`;

  const res = await apiRootApp
    .productProjections()
    .get({ queryArgs: { where, limit, offset } })
    .execute();

  const body: ProductProjectionPagedQueryResponse = res.body;
  return body;
}


/**
 * Fetch up to `max` categories (demo-friendly). You can page if needed.
 */
export async function appListCategories(max = 200): Promise<Category[]> {
  const limit = Math.min(200, max);
  const res = await apiRootApp.categories().get({
    queryArgs: { limit, offset: 0, sort: ['orderHint asc'] },
  }).execute();
  const body: CategoryPagedQueryResponse = res.body;
  return body.results ?? [];
}

/**
 * Build a tree of CategoryDTO from a flat list.
 */
export function buildCategoryTree(categories: Category[], locale: SupportedLocale): CategoryDTO[] {
  const base = categories.map(c => ({ ...categoryRecordToDTO(c, locale), children: [] as CategoryDTO[] }));

  const byId = new Map<string, CategoryDTO>(base.map(c => [c.id, c]));
  const roots: CategoryDTO[] = [];

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  // Sort the tree nodes alphabetically
  const sortTree = (nodes: CategoryDTO[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(n => sortTree(n.children));
  };
  sortTree(roots);

  return roots;
}

/**
 * Get all category slugs for a given locale, flattening the category tree.
 * Useful for generateStaticParams to pre-render category pages.
 */
export async function getAllCategorySlugs(locale: SupportedLocale): Promise<string[]> {
  const categories = await appListCategories(200);
  const tree = buildCategoryTree(categories, locale);
  
  // Flatten the tree to get all slugs
  const flattenSlugs = (nodes: CategoryDTO[]): string[] => {
    return nodes.flatMap(node => [
      node.slug,
      ...(node.children ? flattenSlugs(node.children) : [])
    ]);
  };
  
  return flattenSlugs(tree);
}
