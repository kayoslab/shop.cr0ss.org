'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SupportedLocale, localeToLabel, localeToFlag, SUPPORTED_LOCALES } from '@/lib/i18n/locales';


export default function LangSwitcher({ current }: { current: SupportedLocale }) {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function switchTo(next: SupportedLocale) {
    if (next === current) {
      setOpen(false);
      return;
    }
    
    const parts = pathname.split('/');
    parts[1] = next;
    router.push(parts.join('/'));
    
    startTransition(() => router.refresh());
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-sm hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
      >
        <span className="text-lg leading-none">{localeToFlag(current)}</span>
        <span className="hidden sm:inline">{localeToLabel(current)}</span>
        <svg
          className="h-4 w-4 opacity-70"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          tabIndex={-1}
          className="absolute right-0 z-50 mt-2 w-44 rounded-xl border bg-white p-2 text-sm shadow-xl dark:border-gray-800 dark:bg-gray-900"
        >
          { SUPPORTED_LOCALES.map((loc) => (
            <button
              key={loc}
              role="menuitem"
              disabled={isPending}
              onClick={() => switchTo(loc)}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${
                loc === current ? 'font-medium' : ''
              }`}
            >
              <span className="text-lg leading-none">{localeToFlag(loc)}</span>
              <span>{localeToLabel(loc)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
