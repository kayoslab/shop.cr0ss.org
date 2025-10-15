export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export default function CheckoutPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Checkout</h1>
      <p className="text-gray-600">Streaming-ready. Server Actions would handle address/payment in a real build.</p>
    </main>
  );
}
