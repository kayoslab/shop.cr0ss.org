import type { Category, CategoryPagedQueryResponse, ProductPagedQueryResponse } from '@commercetools/platform-sdk';
import { apiRootApp } from './client';
import { categoryRecordToDTO, type CategoryDTO } from './dto/category';

const esc = (s: string) => s.replaceAll('"', '\\"');

/**
 * Get a Category by its slug (localized).
 */
export async function appGetCategoryBySlug(
  slug: string,
  locale: string
): Promise<Category | null> {
  const fallbackLocale = process.env.DEMO_DEFAULT_LOCALE ?? 'en-GB';
const where = `slug(${locale}="${esc(slug)}") or slug(${fallbackLocale}="${esc(slug)}")`;

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
  const where = `masterData(current(categories(id="${categoryId}")))`;

  const res = await apiRootApp
    .products()
    .get({ queryArgs: { where, limit, offset } })
    .execute();

  const body: ProductPagedQueryResponse = res.body;
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
export function buildCategoryTree(categories: Category[], locale: string): CategoryDTO[] {
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
