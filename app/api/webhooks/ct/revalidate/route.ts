import { revalidateTag } from 'next/cache';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import { productTags, categoryTags } from '@/lib/cache/tags';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as { productId?: string; categorySlug?: string }));
  const productId = body?.productId;
  const categorySlug = body?.categorySlug;

  const revalidatedTags = new Set<string>();

  for (const locale of SUPPORTED_LOCALES) {
    if (productId) {
      const tag = productTags.byId(productId, locale);
      revalidateTag(tag);
      revalidatedTags.add(tag);
    }

    if (categorySlug) {
      const tag = categoryTags.plp(categorySlug, locale);
      revalidateTag(tag);
      revalidatedTags.add(tag);
    }

    const productsTag = productTags.all(locale);
    const categoriesTag = categoryTags.all(locale);
    revalidateTag(productsTag);
    revalidateTag(categoriesTag);
    revalidatedTags.add(productsTag);
    revalidatedTags.add(categoriesTag);
  }

  return Response.json({
    ok: true,
    revalidated: Array.from(revalidatedTags),
  });
}
