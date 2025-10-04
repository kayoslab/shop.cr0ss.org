import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as { productId?: string }));
  const productId = body?.productId;

  revalidateTag('products');
  if (productId) revalidateTag(`product:${productId}`);

  return Response.json({
    ok: true,
    revalidated: ['products', ...(productId ? [`product:${productId}`] : [])],
  });
}
