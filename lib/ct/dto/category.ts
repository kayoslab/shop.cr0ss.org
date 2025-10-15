import type { Category } from '@commercetools/platform-sdk';
import { DEFAULT_LOCALE, SupportedLocale } from '@/lib/i18n/locales';

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  children: CategoryDTO[];
  content?: {
    excerpt?: string;
    description?: string;
    imageUrl?: string;
  };
}

export function categoryRecordToDTO(c: Category, locale: SupportedLocale): Omit<CategoryDTO, 'children'> {
  const name = (c.name as Record<string, string> | undefined)?.[locale]
    ?? (c.name as Record<string, string> | undefined)?.[DEFAULT_LOCALE]
    ?? '—';
  const slug = (c.slug as Record<string, string> | undefined)?.[locale]
    ?? (c.slug as Record<string, string> | undefined)?.[DEFAULT_LOCALE]
    ?? c.id;

  return {
    id: c.id,
    name,
    slug,
    parentId: c.parent?.id ?? null,
  };
}
