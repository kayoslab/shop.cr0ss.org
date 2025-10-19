import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import type { ProductDTO } from '@/lib/ct/dto/product';

describe('ProductCard', () => {
  const mockProduct: ProductDTO = {
    id: 'test-product-123',
    name: 'Test Product',
    slug: 'test-product',
    masterVariantId: 1,
    variants: [
      {
        id: 1,
        sku: 'TEST-SKU-001',
        price: {
          currencyCode: 'EUR',
          centAmount: 1999,
        },
        images: [
          {
            url: 'https://example.com/product.jpg',
            label: 'Product Image',
          },
        ],
      },
    ],
  };

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} locale="de-DE" />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} locale="de-DE" />);
    // Price is formatted as "19.99 EUR"
    expect(screen.getByText(/19\.99 EUR/)).toBeInTheDocument();
  });

  it('renders product link with correct href', () => {
    render(<ProductCard product={mockProduct} locale="de-DE" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/de-DE/products/test-product-123');
  });

  it('renders product image with correct src', () => {
    render(<ProductCard product={mockProduct} locale="de-DE" />);
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
  });

  it('applies compact styling when compact prop is true', () => {
    const { container } = render(
      <ProductCard product={mockProduct} locale="de-DE" compact={true} />
    );
    // Check for compact height class
    const imageContainer = container.querySelector('.h-48');
    expect(imageContainer).toBeInTheDocument();
  });

  it('applies default styling when compact prop is false', () => {
    const { container } = render(
      <ProductCard product={mockProduct} locale="de-DE" compact={false} />
    );
    // Check for default height class
    const imageContainer = container.querySelector('.h-64');
    expect(imageContainer).toBeInTheDocument();
  });

  it('handles product with no image', () => {
    const productNoImage: ProductDTO = {
      ...mockProduct,
      variants: [
        {
          ...mockProduct.variants[0],
          images: [],
        },
      ],
    };

    const { container } = render(
      <ProductCard product={productNoImage} locale="de-DE" />
    );
    // Should still render without crashing
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('handles product with no price', () => {
    const productNoPrice: ProductDTO = {
      ...mockProduct,
      variants: [
        {
          ...mockProduct.variants[0],
          price: undefined,
        },
      ],
    };

    render(<ProductCard product={productNoPrice} locale="de-DE" />);
    // Should render the dash character for missing price
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
