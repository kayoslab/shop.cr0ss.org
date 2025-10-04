import { revalidateTag } from 'next/cache';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const productId = body?.productId;
  const changed: string[] = body?.changed || [];

  revalidateTag('products');
  if (productId) {
    revalidateTag(`product:${productId}`);
  }

  return Response.json({
    ok: true,
    revalidated: [
      'products',
      ...(productId ? [`product:${productId}`] : []),
    ],
  });
}
