import Link from 'next/link';
import Image from 'next/image';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import { Card } from '@/components/Card';
import { PLACEHOLDER_IMAGES } from '@/lib/config/placeholders';

export function CategoryTiles({
  heading = 'Shop by Category',
  categories,
  locale,
}: {
  heading?: string;
  categories: CategoryDTO[];
  locale: string;
}) {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">{heading}</h2>
          <Link className="text-muted-foreground mt-2 hover:underline" href="/category">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/${locale}/category/${category.slug}`} className="group block h-full">
              <Card className="h-full overflow-hidden rounded-2xl border-border transition-shadow hover:shadow-lg flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={category.content?.imageUrl || PLACEHOLDER_IMAGES.CATEGORY}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-lg font-semibold line-clamp-2">{category.content?.title ?? category.name}</h3>
                  {category.content?.excerpt ? (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                      {category.content.excerpt}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground opacity-0 select-none">
                      {/* keeps height consistent when excerpt missing */}
                      placeholder
                    </p>
                  )}
                  <div className="mt-auto" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
