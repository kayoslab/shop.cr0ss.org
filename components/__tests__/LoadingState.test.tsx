import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  LoadingSpinner,
  LoadingPage,
  ProductCardSkeleton,
  ProductGridSkeleton,
} from '../LoadingState';

describe('LoadingSpinner', () => {
  it('renders with default medium size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.h-8.w-8');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('.h-4.w-4');
    expect(spinner).toBeInTheDocument();
  });

  it('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.h-12.w-12');
    expect(spinner).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('has screen reader text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });
});

describe('LoadingPage', () => {
  it('renders loading spinner', () => {
    render(<LoadingPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders visible loading text', () => {
    render(<LoadingPage />);
    // Get the visible text (not the sr-only one)
    const loadingTexts = screen.getAllByText('Loading...');
    const visibleText = loadingTexts.find(el => !el.classList.contains('sr-only'));
    expect(visibleText).toBeInTheDocument();
  });

  it('centers content', () => {
    const { container } = render(<LoadingPage />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
  });
});

describe('ProductCardSkeleton', () => {
  it('renders skeleton placeholder', () => {
    const { container } = render(<ProductCardSkeleton />);
    // Check for skeleton elements with animate-pulse
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has proper structure', () => {
    const { container } = render(<ProductCardSkeleton />);
    // Should have image placeholder
    expect(container.querySelector('.h-64')).toBeInTheDocument();
    // Should have rounded border
    expect(container.querySelector('.rounded-2xl')).toBeInTheDocument();
  });
});

describe('ProductGridSkeleton', () => {
  it('renders default 6 skeleton cards', () => {
    const { container } = render(<ProductGridSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    // 6 cards * 3 skeleton elements per card = 18 total (image + 2 text lines)
    expect(skeletons.length).toBe(18);
  });

  it('renders custom count of skeleton cards', () => {
    const { container } = render(<ProductGridSkeleton count={3} />);
    const cards = container.querySelectorAll('.rounded-2xl');
    expect(cards.length).toBe(3);
  });

  it('uses grid layout', () => {
    const { container } = render(<ProductGridSkeleton />);
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid');
  });
});
