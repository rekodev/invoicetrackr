import { describe, expect, it, vi } from 'vitest';

import * as bankingDb from '../../database/banking-information';
import * as userDb from '../../database/user';
import { postBankAccountOptions } from '../../options/banking-information';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { bankingInformationFactory } from '../../test/factories/banking-information';
import * as bankingController from '../banking-information';

vi.mock('../../database/banking-information');
vi.mock('../../database/user');

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

  describe('POST /api/:userId/banking-information', () => {
    it('normalizes and saves a valid IBAN and BIC', async () => {
      vi.mocked(bankingDb.findBankAccountByAccountNumber).mockResolvedValue(
        undefined
      );
      vi.mocked(bankingDb.insertBankAccountInDb).mockResolvedValue({
        id: 1,
        name: 'Swedbank',
        code: 'HABALT22',
        accountNumber: 'LT121000011101001000'
      });
      vi.mocked(userDb.updateUserSelectedBankAccountInDb).mockResolvedValue({
        id: testUserId
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/:userId/banking-information', {
          ...postBankAccountOptions,
          preHandler: mockAuthMiddleware
        });
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/banking-information`,
        payload: {
          name: ' Swedbank ',
          code: 'haba lt22',
          accountNumber: 'lt12 1000 0111 0100 1000',
          hasSelectedBankAccount: false
        }
      });

      expect(response.statusCode).toBe(201);
      expect(bankingDb.findBankAccountByAccountNumber).toHaveBeenCalledWith(
        testUserId,
        'LT121000011101001000'
      );
      expect(bankingDb.insertBankAccountInDb).toHaveBeenCalledWith(
        testUserId,
        expect.objectContaining({
          name: 'Swedbank',
          code: 'HABALT22',
          accountNumber: 'LT121000011101001000'
        })
      );

      await app.close();
    });

    it('rejects an invalid IBAN before the database is mutated', async () => {
      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/:userId/banking-information', {
          ...postBankAccountOptions,
          preHandler: mockAuthMiddleware
        });
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/banking-information`,
        payload: {
          name: 'Swedbank',
          code: '73000',
          accountNumber: 'LT001234',
          hasSelectedBankAccount: true
        }
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).errors).toContainEqual(
        expect.objectContaining({
          key: 'accountNumber',
          value: 'validation.bankAccount.iban'
        })
      );
      expect(bankingDb.insertBankAccountInDb).not.toHaveBeenCalled();

      await app.close();
    });
  });
});
