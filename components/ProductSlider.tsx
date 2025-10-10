import { type ProductDTO } from '@/lib/ct/dto/product';
import { ProductCard } from './ProductCard';

export default async function ProductSlider({items, heading = 'Recommended' }: { items: ProductDTO[]; heading?: string }) {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </div>
    </section>
  );
}

