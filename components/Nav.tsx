// components/Nav.tsx
import Link from 'next/link';
import type { CategoryDTO } from '@/lib/ct/dto/category';
import LangSwitcher from '@/components/lang-switcher';
import type { SupportedLocale } from '@/lib/i18n/locales';
import CartCountClient from '@/components/cart/CartCountClient';

function BasketIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386a1.5 1.5 0 0 1 1.414 1.043L5.7 6h12.6l1.05 7.35A3 3 0 0 1 16.38 16.5H8.13a3 3 0 0 1-2.97-2.55L4.2 6M9 10.5h6m-6 3h6M9 3l-1.5 3m7.5-3L18 6"
      />
    </svg>
  );
}

export default async function Nav({
  topLevel,
  locale,
}: {
  topLevel: CategoryDTO[];
  locale: SupportedLocale;
}) {
  const MAX_INLINE = 6;
  const inline = topLevel.slice(0, MAX_INLINE);
  const overflow = topLevel.slice(MAX_INLINE);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Left: Brand + primary nav */}
        <div className="flex min-w-0 items-center gap-6">
          <Link href={`/${locale}/`} className="shrink-0 text-lg font-semibold tracking-tight">
            Demo Store
          </Link>

          {/* Desktop primary nav */}
          <nav className="hidden items-center gap-5 md:flex" aria-label="Primary">
            {inline.map((c) => (
              <Link
                key={c.id}
                href={`/${locale}/category/${c.slug}`}
                className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
              >
                {c.name}
              </Link>
            ))}
            {overflow.length > 0 && (
              <div className="group relative">
                <button
                  type="button"
                  className="text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                  aria-haspopup="menu"
                  aria-expanded="false"
                >
                  More
                </button>
                <div className="invisible absolute left-0 mt-2 min-w-[16rem] rounded-xl border bg-white p-3 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 dark:border-gray-800 dark:bg-gray-900">
                  <ul className="space-y-1" role="menu" aria-label="More categories">
                    {overflow.map((c) => (
                      <li key={c.id} role="none">
                        <Link
                          role="menuitem"
                          href={`/${locale}/category/${c.slug}`}
                          className="block rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 hover:text-black dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Right: Language (desktop) + Basket */}
        <div className="flex items-center gap-4">
          {/* Show language switcher on md+ only to avoid duplicate on mobile */}
          <div className="hidden md:block">
            <LangSwitcher current={locale} />
          </div>
          <Link href={`/${locale}/cart`} className="relative inline-flex items-center" aria-label="Cart">
            <BasketIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <CartCountClient locale={locale} />
          </Link>
        </div>
      </div>

      {/* Mobile: language + category scroller */}
      <div className="border-t bg-white px-2 py-2 dark:bg-gray-900 md:hidden">
        <div className="mb-2 flex justify-end">
          <LangSwitcher current={locale} />
        </div>
        <nav className="flex items-center gap-3 overflow-x-auto scrollbar-none" aria-label="Mobile categories">
          {topLevel.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/category/${c.slug}`}
              className="shrink-0 rounded-full border px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
