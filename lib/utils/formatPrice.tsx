import React from 'react';
import type { JSX } from 'react';


/**
 * Shared price formatting utilities for consistent price display across the application
 */

export interface PriceData {
  currencyCode: string;
  centAmount: number;
  discounted?: boolean;
  discountedCentAmount?: number;
}

export interface MoneyData {
  currencyCode: string;
  centAmount: number;
}

/**
 * Converts cent amount to decimal price string
 * @example formatCentAmount(1299, 'EUR') => '12.99 EUR'
 */
export function formatCentAmount(centAmount: number, currencyCode: string): string {
  return `${(centAmount / 100).toFixed(2)} ${currencyCode}`;
}

/**
 * Formats price with optional discount display (returns JSX for discount styling)
 * Used in ProductCard and other product listings
 */
export function formatPrice(price?: PriceData): string | React.JSX.Element {
  if (!price) return '—';

  const basePrice = formatCentAmount(price.centAmount, price.currencyCode);

  if (price.discounted && price.discountedCentAmount && price.discountedCentAmount < price.centAmount) {
    const discountedPrice = formatCentAmount(price.discountedCentAmount, price.currencyCode);
    return (
      <div className="flex items-baseline gap-2">
        <span className="font-semibold">
          {discountedPrice}
        </span>
        <span className="text-xs text-gray-500 line-through">
          {basePrice}
        </span>
      </div>
    );
  }

  return basePrice;
}

/**
 * Formats money with optional discount (returns JSX with size variants)
 * Used in Product Detail Page with larger text
 */
export function formatMoney(
  money?: MoneyData,
  discounted?: MoneyData,
  options?: { baseSize?: string; discountedSize?: string }
): JSX.Element | string {
  if (!money) return '';

  const { baseSize = 'text-2xl', discountedSize = 'text-sm' } = options || {};
  const basePrice = formatCentAmount(money.centAmount, money.currencyCode);

  if (discounted && discounted.centAmount < money.centAmount) {
    const discountedPrice = formatCentAmount(discounted.centAmount, money.currencyCode);
    return (
      <div className="flex items-baseline gap-2">
        <span className={`${baseSize} font-semibold`}>{discountedPrice}</span>
        <span className={`${discountedSize} text-gray-500 line-through`}>{basePrice}</span>
      </div>
    );
  }

  return <span className={`${baseSize} font-semibold`}>{basePrice}</span>;
}

/**
 * Formats price for cart line items (smaller text variant)
 */
export function formatCartPrice(price?: PriceData): JSX.Element {
  if (!price) return <span>-</span>;

  const { currencyCode, centAmount, discounted, discountedCentAmount } = price;

  if (discounted && typeof discountedCentAmount === 'number' && discountedCentAmount < centAmount) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold">
          {formatCentAmount(discountedCentAmount, currencyCode)}
        </span>
        <span className="text-xs text-gray-500 line-through">
          {formatCentAmount(centAmount, currencyCode)}
        </span>
      </div>
    );
  }

  return <span className="text-sm font-medium">{formatCentAmount(centAmount, currencyCode)}</span>;
}
