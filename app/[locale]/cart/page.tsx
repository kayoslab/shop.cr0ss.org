export const runtime = 'edge'; // Edge SSR
export const dynamic = 'force-dynamic';

export default function CartPage() {
  // in a real app read a session/cart token; minimized for demo
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold mb-2">Your cart</h1>
      <p className="text-gray-600">Edge-rendered to keep session-bound pages fast globally.</p>
    </main>
  );
}
