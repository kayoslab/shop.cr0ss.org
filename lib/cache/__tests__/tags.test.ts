import { describe, it, expect } from 'vitest';
import { productTags, categoryTags, cmsTags } from '../tags';

describe('productTags', () => {
  it('generates correct tag for all products by locale', () => {
    expect(productTags.all('de-DE')).toBe('products:de-DE');
    expect(productTags.all('en-GB')).toBe('products:en-GB');
  });

  it('generates correct tag for product by ID and locale', () => {
    expect(productTags.byId('abc123', 'de-DE')).toBe('product:abc123:de-DE');
    expect(productTags.byId('xyz789', 'en-GB')).toBe('product:xyz789:en-GB');
  });

  it('handles different product IDs', () => {
    const tag1 = productTags.byId('product-1', 'de-DE');
    const tag2 = productTags.byId('product-2', 'de-DE');

    expect(tag1).not.toBe(tag2);
    expect(tag1).toBe('product:product-1:de-DE');
    expect(tag2).toBe('product:product-2:de-DE');
  });
});

describe('categoryTags', () => {
  it('generates correct tag for all categories by locale', () => {
    expect(categoryTags.all('de-DE')).toBe('categories:de-DE');
    expect(categoryTags.all('en-GB')).toBe('categories:en-GB');
  });

  it('generates correct tag for category by slug and locale', () => {
    expect(categoryTags.bySlug('electronics', 'de-DE')).toBe('category:electronics:de-DE');
    expect(categoryTags.bySlug('clothing', 'en-GB')).toBe('category:clothing:en-GB');
  });

  it('generates correct PLP tag for category', () => {
    expect(categoryTags.plp('electronics', 'de-DE')).toBe('plp:cat:electronics:de-DE');
    expect(categoryTags.plp('clothing', 'en-GB')).toBe('plp:cat:clothing:en-GB');
  });

  it('handles different category slugs', () => {
    const tag1 = categoryTags.bySlug('shoes', 'de-DE');
    const tag2 = categoryTags.bySlug('accessories', 'de-DE');

    expect(tag1).not.toBe(tag2);
    expect(tag1).toBe('category:shoes:de-DE');
    expect(tag2).toBe('category:accessories:de-DE');
  });
});

describe('cmsTags', () => {
  it('generates correct tag for home page by locale', () => {
    expect(cmsTags.home('de-DE')).toBe('cms:home:de-DE');
    expect(cmsTags.home('en-GB')).toBe('cms:home:en-GB');
  });

  it('generates correct tag for category CMS content', () => {
    expect(cmsTags.category('electronics', 'de-DE')).toBe('cms:categories:electronics:de-DE');
    expect(cmsTags.category('clothing', 'en-GB')).toBe('cms:categories:clothing:en-GB');
  });

  it('handles different category slugs for CMS', () => {
    const tag1 = cmsTags.category('sports', 'de-DE');
    const tag2 = cmsTags.category('toys', 'de-DE');

    expect(tag1).not.toBe(tag2);
    expect(tag1).toBe('cms:categories:sports:de-DE');
    expect(tag2).toBe('cms:categories:toys:de-DE');
  });
});

describe('tag uniqueness', () => {
  it('ensures tags are unique across different types', () => {
    const productTag = productTags.all('de-DE');
    const categoryTag = categoryTags.all('de-DE');
    const cmsTag = cmsTags.home('de-DE');

    expect(productTag).not.toBe(categoryTag);
    expect(productTag).not.toBe(cmsTag);
    expect(categoryTag).not.toBe(cmsTag);
  });

  it('ensures tags are unique across locales', () => {
    const deTag = productTags.all('de-DE');
    const enTag = productTags.all('en-GB');

    expect(deTag).not.toBe(enTag);
  });

  it('ensures specific tags differ from general tags', () => {
    const allProducts = productTags.all('de-DE');
    const specificProduct = productTags.byId('123', 'de-DE');

    expect(allProducts).not.toBe(specificProduct);
  });
});

describe('tag format consistency', () => {
  it('follows consistent pattern for specific items', () => {
    const productTag = productTags.byId('abc', 'de-DE');
    const categoryTag = categoryTags.bySlug('test', 'de-DE');
    const plpTag = categoryTags.plp('test', 'de-DE');
    const cmsTag = cmsTags.category('test', 'de-DE');

    // Product tags: product:id:locale (3 parts)
    expect(productTag.split(':')).toHaveLength(3);
    expect(productTag).toBe('product:abc:de-DE');

    // Category tags: category:slug:locale (3 parts)
    expect(categoryTag.split(':')).toHaveLength(3);
    expect(categoryTag).toBe('category:test:de-DE');

    // PLP tags: plp:cat:slug:locale (4 parts)
    expect(plpTag.split(':')).toHaveLength(4);
    expect(plpTag).toBe('plp:cat:test:de-DE');

    // CMS tags: cms:categories:slug:locale (4 parts)
    expect(cmsTag.split(':')).toHaveLength(4);
    expect(cmsTag).toBe('cms:categories:test:de-DE');
  });

  it('follows {type}:{locale} pattern for general items', () => {
    const productTag = productTags.all('de-DE');
    const categoryTag = categoryTags.all('de-DE');

    expect(productTag.split(':')).toHaveLength(2);
    expect(categoryTag.split(':')).toHaveLength(2);
  });
});
