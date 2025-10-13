import Link from 'next/link';
import Image from 'next/image';

export default function Hero({
  title,
  subtitle,
  ctaText = 'Shop Products',
  ctaLink = '/products',
  imageUrl,
}: {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
}) {
  return (
    <section className="relative w-full overflow-hidden bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[500px] lg:min-h-[600px]">
          {/* Text Content */}
          <div className="space-y-6 py-12 lg:py-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">{title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty max-w-[600px]">{subtitle}</p>
            <div>
              <Link
                href={ctaLink}
                className="inline-flex items-center rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
              {ctaText}
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-[400px] lg:h-[600px] rounded-2xl overflow-hidden">
              {imageUrl && (
              <Image
                src={imageUrl}
                alt="Hero Image"
                fill
                className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
