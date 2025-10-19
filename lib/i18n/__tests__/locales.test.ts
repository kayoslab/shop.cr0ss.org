/**
 * Unit tests for locale utilities
 */

import { describe, it, expect } from 'vitest';
import {
  isSupportedLocale,
  validateLocale,
  localeToCurrency,
  localeToCountry,
  countryToLocale,
  currencyToLocale,
  otherLocale,
  DEFAULT_LOCALE,
} from '../locales';

describe('isSupportedLocale', () => {
  it('should return true for supported locales', () => {
    expect(isSupportedLocale('de-DE')).toBe(true);
    expect(isSupportedLocale('en-GB')).toBe(true);
  });

  it('should return false for unsupported locales', () => {
    expect(isSupportedLocale('fr-FR')).toBe(false);
    expect(isSupportedLocale('en-US')).toBe(false);
    expect(isSupportedLocale('invalid')).toBe(false);
  });
});

describe('validateLocale', () => {
  it('should return locale if valid', () => {
    expect(validateLocale('de-DE')).toBe('de-DE');
    expect(validateLocale('en-GB')).toBe('en-GB');
  });

  it('should return default locale if invalid', () => {
    expect(validateLocale('fr-FR')).toBe(DEFAULT_LOCALE);
    expect(validateLocale('invalid')).toBe(DEFAULT_LOCALE);
    expect(validateLocale('')).toBe(DEFAULT_LOCALE);
  });
});

describe('localeToCurrency', () => {
  it('should return EUR for de-DE', () => {
    expect(localeToCurrency('de-DE')).toBe('EUR');
  });

  it('should return GBP for en-GB', () => {
    expect(localeToCurrency('en-GB')).toBe('GBP');
  });
});

describe('localeToCountry', () => {
  it('should return DE for de-DE', () => {
    expect(localeToCountry('de-DE')).toBe('DE');
  });

  it('should return GB for en-GB', () => {
    expect(localeToCountry('en-GB')).toBe('GB');
  });
});

describe('countryToLocale', () => {
  it('should return de-DE for DE', () => {
    expect(countryToLocale('DE')).toBe('de-DE');
  });

  it('should return en-GB for other countries', () => {
    expect(countryToLocale('GB')).toBe('en-GB');
    expect(countryToLocale('US')).toBe('en-GB');
  });
});

describe('currencyToLocale', () => {
  it('should return de-DE for EUR', () => {
    expect(currencyToLocale('EUR')).toBe('de-DE');
  });

  it('should return en-GB for other currencies', () => {
    expect(currencyToLocale('GBP')).toBe('en-GB');
    expect(currencyToLocale('USD')).toBe('en-GB');
  });
});

describe('otherLocale', () => {
  it('should toggle between locales', () => {
    expect(otherLocale('de-DE')).toBe('en-GB');
    expect(otherLocale('en-GB')).toBe('de-DE');
  });
});
