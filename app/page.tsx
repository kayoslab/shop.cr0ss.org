import { headers } from 'next/headers';

export const revalidate = 300;
export const dynamic = 'force-static';

export default async function Home() {
  const h = headers();
  const variant = (await h).get('x-variant') ?? 'A';
  const locale = (await h).get('x-locale') ?? process.env.DEMO_DEFAULT_LOCALE!;

  return (
    <main className="p-6">
      <section className="mb-8">
        {variant === 'A' ? (
          <div className="h-40 rounded bg-gray-200 flex items-center justify-center">
            <p className="text-xl">Promo Variant A ({locale})</p>
          </div>
        ) : (
          <div className="h-40 rounded bg-gray-200 flex items-center justify-center">
            <p className="text-xl">Promo Variant B ({locale})</p>
          </div>
        )}
      </section>
      <h2 className="text-2xl font-semibold">Welcome</h2>
      <p className="text-gray-600">Localized hero/promo via Edge headers. Zero CLS.</p>
    </main>
  );
}
