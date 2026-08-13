import { describe, expect, it } from 'vitest';

import { localizeInvoiceUnit } from '../invoice';

describe('localizeInvoiceUnit', () => {
  it('translates canonical invoice units for rendered invoices', () => {
    expect(
      localizeInvoiceUnit('hour', (unit) =>
        unit === 'hour' ? 'Valanda' : unit
      )
    ).toBe('Valanda');
  });

  it('preserves custom invoice units', () => {
    expect(localizeInvoiceUnit('sprint', (unit) => unit)).toBe('sprint');
  });
});
