import Link from 'next/link';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import Image from 'next/image';
import { Card } from '@/components/card';

export function CategoryTiles({
  heading = 'Shop by Category',
  categories,
}: {
  heading?: string;
  categories: CategoryDTO[];
}) {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
          <Link className="text-muted-foreground mt-2 hover:underline" href="/category">View all</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="group">
              <Card className="overflow-hidden rounded-2xl border-border hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={/*category.image ||*/ "/placeholder.svg?height=200&width=400"}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  {<p className="text-sm text-muted-foreground mt-1">{"Lorem Ipsum"}</p>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}