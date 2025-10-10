import type { Category } from '@commercetools/platform-sdk';

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

export function categoryRecordToDTO(c: Category, locale: string): Omit<CategoryDTO, 'children'> {
  const name = (c.name as Record<string, string> | undefined)?.[locale]
    ?? (c.name as Record<string, string> | undefined)?.['en-GB']
    ?? '—';
  const slug = (c.slug as Record<string, string> | undefined)?.[locale]
    ?? (c.slug as Record<string, string> | undefined)?.['en-GB']
    ?? c.id;

  return {
    id: c.id,
    name,
    slug,
    parentId: c.parent?.id ?? null,
  };
}
