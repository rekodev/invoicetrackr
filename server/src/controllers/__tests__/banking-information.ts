import { describe, expect, it, vi } from 'vitest';

import * as bankingController from '../banking-information';
import * as bankingDb from '../../database/banking-information';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { bankingInformationFactory } from '../../test/factories/banking-information';

vi.mock('../../database/banking-information');

describe('Banking Information Controller', () => {
  const testUserId = 1;
  const mockBankAccount = bankingInformationFactory.build({
    accountNumber: 'TEST123456789'
  });

  describe('GET /api/:userId/banking-information', () => {
    it('should return all bank accounts for a user', async () => {
      vi.mocked(bankingDb.getBankAccountsFromDb).mockResolvedValue([
        { ...mockBankAccount, id: 1 },
        { ...mockBankAccount, id: 2, accountNumber: 'TEST987654321' }
      ]);

      const { getBankAccounts } = bankingController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId/banking-information',
          {
            preHandler: mockAuthMiddleware
          },
          getBankAccounts
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}/banking-information`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.bankAccounts).toBeDefined();
      expect(Array.isArray(body.bankAccounts)).toBe(true);
      expect(body.bankAccounts.length).toBe(2);
      expect(body.bankAccounts[0]).toHaveProperty('accountNumber');
      expect(body.bankAccounts[0].accountNumber).toBe('TEST123456789');
      expect(bankingDb.getBankAccountsFromDb).toHaveBeenCalledWith(testUserId);

      await app.close();
    });
  });
});
