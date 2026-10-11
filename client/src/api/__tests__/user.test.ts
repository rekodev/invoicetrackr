import { describe, expect, it, vi } from 'vitest';

import api from '../api-instance';
import { deleteUserAccount, updateUserLanguage } from '../user';

vi.mock('../api-instance', () => ({
  default: {
    delete: vi.fn(),
    put: vi.fn()
  }
}));

describe('account requests', () => {
  it('sends the deletion confirmation and language as top-level bodies', async () => {
    await deleteUserAccount(1, { confirmEmail: 'owner@example.com' });
    await updateUserLanguage(1, { language: 'lt' });

    expect(api.delete).toHaveBeenCalledWith('/api/users/1', {
      confirmEmail: 'owner@example.com'
    });
    expect(api.put).toHaveBeenCalledWith('/api/users/1/language', {
      language: 'lt'
    });
  });
});
