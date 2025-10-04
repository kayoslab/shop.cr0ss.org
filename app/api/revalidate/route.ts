// ...existing imports
import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as { productId?: string; categorySlug?: string }));
  const productId = body?.productId;
  const categorySlug = body?.categorySlug;

  revalidateTag('products');
  if (productId) revalidateTag(`product:${productId}`);
  revalidateTag('categories');
  if (categorySlug) revalidateTag(`plp:cat:${categorySlug}`);

  return Response.json({
    ok: true,
    revalidated: [
      'products',
      ...(productId ? [`product:${productId}`] : []),
      'categories',
      ...(categorySlug ? [`plp:cat:${categorySlug}`] : []),
    ],
  });
}
