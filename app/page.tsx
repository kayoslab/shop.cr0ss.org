import Hero from '@/components/Hero';
import CategoryTiles from '@/components/CategoryTiles';
import ProductSlider from '@/components/ProductSlider';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <CategoryTiles />
      <ProductSlider />
    </main>
  );
}
