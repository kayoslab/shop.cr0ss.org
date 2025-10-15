import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as { productId?: string; categorySlug?: string }));
  const productId = body?.productId;
  const categorySlug = body?.categorySlug;
  
  for (const locale of ['de-DE','en-GB']) {
    if (productId) revalidateTag(`product:${productId}:${locale}`);
    if (categorySlug) revalidateTag(`plp:cat:${categorySlug}:${locale}`);
    
    revalidateTag(`products:${locale}`);
    revalidateTag(`categories:${locale}`);
    // revalidateTag(`cms:home:${locale}`);
  }

  

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
