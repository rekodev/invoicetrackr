import { describe, expect, it } from 'vitest';

import { resolveLocale } from '../resolve-locale';

describe('resolveLocale', () => {
  it('returns Lithuanian when the locale cookie is lt', () => {
    expect(resolveLocale('lt', 'en-US,en;q=0.9')).toBe('lt');
  });

  it('returns English when the locale cookie is en', () => {
    expect(resolveLocale('en', 'lt-LT,lt;q=0.9')).toBe('en');
  });

  it('gives the cookie priority over Accept-Language', () => {
    expect(resolveLocale('en', 'lt-LT,lt;q=0.9')).toBe('en');
    expect(resolveLocale('lt', 'en-US,en;q=0.9')).toBe('lt');
  });

  it('returns Lithuanian for a Lithuanian browser without a cookie', () => {
    expect(resolveLocale(undefined, 'lt-LT,lt;q=0.9,en;q=0.8')).toBe('lt');
  });

  it('trims whitespace before parsing Accept-Language quality weights', () => {
    expect(resolveLocale(undefined, 'lt; q=0.8,en; q=0.9')).toBe('en');
  });

  it('returns English for an English browser without a cookie', () => {
    expect(resolveLocale(undefined, 'en-US,en;q=0.9')).toBe('en');
  });

  it('defaults to English for an unsupported browser language', () => {
    expect(resolveLocale(undefined, 'de-DE,de;q=0.9')).toBe('en');
  });

  it('defaults to English when Accept-Language is missing', () => {
    expect(resolveLocale(undefined, null)).toBe('en');
  });

  it('ignores an unsupported locale cookie', () => {
    expect(resolveLocale('de', 'lt-LT,lt;q=0.9')).toBe('lt');
  });
});
