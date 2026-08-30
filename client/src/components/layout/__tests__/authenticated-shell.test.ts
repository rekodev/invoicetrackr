import { describe, expect, it } from 'vitest';

import { SETTINGS_PAGE } from '@/lib/constants/pages';

import { isCurrentPath } from '../navigation';

describe('authenticated shell route matching', () => {
  it('matches nested routes without activating sibling modules', () => {
    expect(isCurrentPath('/invoices/edit/42', '/invoices')).toBe(true);
    expect(isCurrentPath('/invoices/edit/42', '/payments')).toBe(false);
  });

  it('keeps nested settings screens inside the Settings section', () => {
    expect(isCurrentPath('/settings/payment-methods', SETTINGS_PAGE)).toBe(
      true
    );
  });
});
