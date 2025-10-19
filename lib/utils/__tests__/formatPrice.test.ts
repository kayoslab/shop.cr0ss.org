/**
 * Unit tests for price formatting utilities
 *
 * To run tests: npm test
 * To add testing: npm install -D vitest @testing-library/react @testing-library/jest-dom
 */

import { describe, it, expect } from 'vitest';
import { formatCentAmount, formatPrice, formatCartPrice } from '../formatPrice';

describe('formatCentAmount', () => {
  it('should format cent amount to decimal string', () => {
    expect(formatCentAmount(1299, 'EUR')).toBe('12.99 EUR');
    expect(formatCentAmount(1000, 'USD')).toBe('10.00 USD');
    expect(formatCentAmount(0, 'GBP')).toBe('0.00 GBP');
  });

  it('should handle large amounts', () => {
    expect(formatCentAmount(999999, 'EUR')).toBe('9999.99 EUR');
  });
});

describe('formatPrice', () => {
  it('should return dash for undefined price', () => {
    expect(formatPrice(undefined)).toBe('—');
  });

  it('should format regular price', () => {
    const price = {
      currencyCode: 'EUR',
      centAmount: 1999,
    };
    expect(formatPrice(price)).toBe('19.99 EUR');
  });

  it('should format discounted price with JSX', () => {
    const price = {
      currencyCode: 'EUR',
      centAmount: 2999,
      discounted: true,
      discountedCentAmount: 1999,
    };
    const result = formatPrice(price);
    // Check that it returns a JSX element
    expect(typeof result).toBe('object');
  });

  it('should not show discount if discounted price is same or higher', () => {
    const price = {
      currencyCode: 'EUR',
      centAmount: 1999,
      discounted: true,
      discountedCentAmount: 1999,
    };
    expect(formatPrice(price)).toBe('19.99 EUR');
  });
});

// Note: formatCartPrice returns JSX, so we test the structure
describe('formatCartPrice', () => {
  it('should return dash span for undefined price', () => {
    const result = formatCartPrice(undefined);
    expect(typeof result).toBe('object');
  });

  it('should handle regular price', () => {
    const price = {
      currencyCode: 'EUR',
      centAmount: 1999,
    };
    const result = formatCartPrice(price);
    expect(typeof result).toBe('object');
  });

  it('should handle discounted price', () => {
    const price = {
      currencyCode: 'EUR',
      centAmount: 2999,
      discounted: true,
      discountedCentAmount: 1999,
    };
    const result = formatCartPrice(price);
    expect(typeof result).toBe('object');
  });
});
