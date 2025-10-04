import { notFound } from 'next/navigation';
import type { ProductDTO } from '@/lib/ct/dto/product';

async function fetchProduct(id: string): Promise<ProductDTO | null> {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const res = await fetch(`${base}/api/products/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load product');
  return res.json() as Promise<ProductDTO>;
}

export default async function ProductDetailPage({ params: { id } }: { params: { id: string } }) {
  const product = await fetchProduct(id);
  if (!product) return notFound();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-2">{product.name}</h1>
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt={product.name} className="rounded mb-4" />
      ) : null}
      <div className="text-lg">
        {product.price ? `${(product.price.amount / 100).toFixed(2)} ${product.price.currency}` : 'No price'}
      </div>
    </main>
  );
}
