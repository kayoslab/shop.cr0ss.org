import Link from 'next/link';

async function fetchProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/api/products`, {});
  if (!res.ok) throw new Error('Failed to load products');
  return res.json() as Promise<{ items: Array<any> }>;
}

export default async function ProductsPage() {
  const data = await fetchProducts();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Products (Headless via /api)</h1>
      <ul className="grid grid-cols-2 gap-4">
        {data.items.map((p) => (
          <li key={p.id} className="border rounded p-4">
            <div className="font-medium">{p.name}</div>
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt={p.name} className="mt-2 rounded" />
            ) : null}
            <div className="text-sm text-gray-500 mt-1">
              {p.price ? `${(p.price.amount/100).toFixed(2)} ${p.price.currency}` : 'No price'}
            </div>
            <Link className="text-blue-600" href={`/products/${p.id}`}>View</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
