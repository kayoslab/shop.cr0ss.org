import Link from 'next/link';

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
    <section className="relative h-[100svh] w-full overflow-hidden bg-gradient-to-b from-gray-100 to-white dark:from-gray-900 dark:to-gray-950">
      {/* optional background image */}
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
        />
      )}

      {/* soft halos */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gray-200 blur-3xl dark:bg-gray-800" />
        <div className="absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-gray-200 blur-3xl dark:bg-gray-800" />
      </div>

      <div className="relative mx-auto flex h-full max-w-6xl items-center px-6">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{title}</h1>
          {subtitle && (
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              {subtitle}
            </p>
          )}

          <div className="mt-8 flex gap-3">
            <Link
              href={ctaLink}
              className="inline-flex items-center rounded-lg bg-black px-5 py-3 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
