import { apiRootApp } from './client';

export async function searchProducts(limit = 12, locale = 'de-DE') {
  const res = await apiRootApp.productProjections().search().get({
    queryArgs: { limit, sort: ['name.' + locale + ' asc'] },
  }).execute();
  return res.body.results;
}

export async function searchProductBySlug(slug: string, locale='de-DE') {
  const res = await apiRootApp.productProjections().search().get({
    queryArgs: { filter: [`slug.${locale}:"${slug}"`], limit: 1 },
  }).execute();
  return res.body.results[0] || null;
}

export async function getProducts(
  { limit = 12, offset = 0 }: { limit?: number; offset?: number } = {}
) {
  const res = await apiRootApp.products().get({
    queryArgs: { limit, offset },
  }).execute();
  return res.body;
}

export async function getProductById(id: string) {
  const res = await apiRootApp.products().withId({ ID: id }).get().execute();
  return res.body;
}