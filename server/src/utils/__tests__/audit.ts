import { describe, expect, it } from 'vitest';

import { sanitizeAuditValue } from '../audit-value';

describe('sanitizeAuditValue', () => {
  it('redacts secrets recursively without removing useful financial context', () => {
    expect(
      sanitizeAuditValue({
        amount: '125.00',
        password: 'secret',
        nested: { token: 'private', status: 'issued' },
        attachments: [{ secureUrl: 'https://private', fileName: 'receipt.pdf' }]
      })
    ).toEqual({
      amount: '125.00',
      password: '[REDACTED]',
      nested: { token: '[REDACTED]', status: 'issued' },
      attachments: [{ secureUrl: '[REDACTED]', fileName: 'receipt.pdf' }]
    });
  });
});
