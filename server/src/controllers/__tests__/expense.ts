import { DEFAULT_CURRENCY, ExpenseInput } from '@invoicetrackr/types';
import { describe, expect, it, vi } from 'vitest';

import * as expenseDb from '../../database/expense';
import { SelectExpense } from '../../database/schema';
import {
  postExpenseOptions,
  updateExpenseOptions
} from '../../options/expense';
import { createTestApp, mockAuthMiddleware } from '../../test/app';

vi.mock('../../database/expense');

const testUserId = 1;
const testExpenseId = 10;

const buildExpensePayload = (
  overrides: Partial<ExpenseInput> = {}
): ExpenseInput => ({
  expenseDate: '2026-07-08',
  paymentDate: '',
  supplier: ' Supplier UAB ',
  documentNumber: ' EXP-1 ',
  description: ' Accounting software ',
  category: 'software',
  currency: DEFAULT_CURRENCY,
  totalAmount: '100.00',
  eurAmount: '100.00',
  vatAmount: '21.00',
  businessUsePercentage: '50',
  paymentMethod: 'card',
  notes: ' Paid by company card ',
  ...overrides
});

const buildExpenseFromDb = (
  overrides: Partial<SelectExpense> = {}
): SelectExpense => ({
  id: testExpenseId,
  userId: testUserId,
  expenseDate: '2026-07-08',
  paymentDate: null,
  supplier: 'Supplier UAB',
  documentNumber: 'EXP-1',
  description: 'Accounting software',
  category: 'software',
  currency: DEFAULT_CURRENCY,
  totalAmount: '100.00',
  eurAmount: '100.00',
  vatAmount: '21.00',
  businessUsePercentage: '50.00',
  deductibleAmount: '50.00',
  paymentMethod: 'card',
  notes: 'Paid by company card',
  deletedAt: null,
  createdAt: '2026-07-08T00:00:00.000Z',
  updatedAt: '2026-07-08T00:00:00.000Z',
  ...overrides
});

const createExpenseWriteApp = () =>
  createTestApp((fastifyApp) => {
    fastifyApp.post('/api/:userId/expenses', {
      ...postExpenseOptions,
      preHandler: mockAuthMiddleware
    });
    fastifyApp.put('/api/:userId/expenses/:expenseId', {
      ...updateExpenseOptions,
      preHandler: mockAuthMiddleware
    });
  });

const mockInsertExpense = () => {
  vi.mocked(expenseDb.insertExpenseInDb).mockImplementation(async (expense) =>
    buildExpenseFromDb({ ...expense, id: testExpenseId })
  );
};

const mockUpdateExpense = () => {
  vi.mocked(expenseDb.updateExpenseInDb).mockImplementation(
    async ({ userId, expenseId, expense }) =>
      buildExpenseFromDb({ ...expense, id: expenseId, userId })
  );
};

describe('Expense Controller', () => {
  describe('POST /api/:userId/expenses', () => {
    it('creates an expense with normalized totals and computed deductible amount', async () => {
      mockInsertExpense();
      const app = await createExpenseWriteApp();

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/expenses`,
        payload: buildExpensePayload({
          totalAmount: '123.4',
          eurAmount: undefined,
          vatAmount: '23.4',
          businessUsePercentage: '33.33'
        })
      });

      expect(response.statusCode).toBe(201);
      expect(expenseDb.insertExpenseInDb).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
          totalAmount: '123.40',
          eurAmount: '123.40',
          vatAmount: '23.40',
          businessUsePercentage: '33.33',
          deductibleAmount: '41.13'
        })
      );
      expect(JSON.parse(response.body).expense.deductibleAmount).toBe('41.13');

      await app.close();
    });

    it('ignores client-supplied deductibleAmount and stores the server-computed value', async () => {
      mockInsertExpense();
      const app = await createExpenseWriteApp();

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/expenses`,
        payload: {
          ...buildExpensePayload({
            totalAmount: '80.00',
            businessUsePercentage: '25'
          }),
          deductibleAmount: '9999.99'
        }
      });

      expect(response.statusCode).toBe(201);
      expect(expenseDb.insertExpenseInDb).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: '80.00',
          businessUsePercentage: '25.00',
          deductibleAmount: '20.00'
        })
      );

      await app.close();
    });
  });

  describe('PUT /api/:userId/expenses/:expenseId', () => {
    it('recomputes deductible amount when total or business-use percentage changes', async () => {
      mockUpdateExpense();
      const app = await createExpenseWriteApp();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/${testUserId}/expenses/${testExpenseId}`,
        payload: buildExpensePayload({
          id: testExpenseId,
          totalAmount: '250.00',
          businessUsePercentage: '40'
        })
      });

      expect(response.statusCode).toBe(200);
      expect(expenseDb.updateExpenseInDb).toHaveBeenCalledWith({
        userId: testUserId,
        expenseId: testExpenseId,
        expense: expect.objectContaining({
          totalAmount: '250.00',
          businessUsePercentage: '40.00',
          deductibleAmount: '100.00'
        })
      });

      await app.close();
    });

    it('ignores client-supplied deductibleAmount and stores the recomputed value', async () => {
      mockUpdateExpense();
      const app = await createExpenseWriteApp();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/${testUserId}/expenses/${testExpenseId}`,
        payload: {
          ...buildExpensePayload({
            id: testExpenseId,
            totalAmount: '0.01',
            businessUsePercentage: '50'
          }),
          deductibleAmount: '0.00'
        }
      });

      expect(response.statusCode).toBe(200);
      expect(expenseDb.updateExpenseInDb).toHaveBeenCalledWith(
        expect.objectContaining({
          expense: expect.objectContaining({
            totalAmount: '0.01',
            businessUsePercentage: '50.00',
            deductibleAmount: '0.01'
          })
        })
      );

      await app.close();
    });
  });

  describe('schema validation', () => {
    const invalidExpenseOverrides: Array<[string, Partial<ExpenseInput>]> = [
      ['negative totalAmount', { totalAmount: '-1.00' }],
      ['negative vatAmount', { vatAmount: '-1.00' }],
      ['negative businessUsePercentage', { businessUsePercentage: '-1' }],
      ['businessUsePercentage above 100', { businessUsePercentage: '100.01' }],
      ['totalAmount with more than two decimals', { totalAmount: '1.001' }],
      ['eurAmount with more than two decimals', { eurAmount: '1.001' }],
      ['vatAmount with more than two decimals', { vatAmount: '1.001' }]
    ];

    it.each(invalidExpenseOverrides)(
      'returns 400 for %s on create',
      async (_label, overrides) => {
        const app = await createExpenseWriteApp();

        const response = await app.inject({
          method: 'POST',
          url: `/api/${testUserId}/expenses`,
          payload: buildExpensePayload(overrides)
        });

        expect(response.statusCode).toBe(400);
        expect(expenseDb.insertExpenseInDb).not.toHaveBeenCalled();
        expect(expenseDb.updateExpenseInDb).not.toHaveBeenCalled();

        await app.close();
      }
    );

    it.each(invalidExpenseOverrides)(
      'returns 400 for %s on update',
      async (_label, overrides) => {
        const app = await createExpenseWriteApp();

        const response = await app.inject({
          method: 'PUT',
          url: `/api/${testUserId}/expenses/${testExpenseId}`,
          payload: buildExpensePayload({ id: testExpenseId, ...overrides })
        });

        expect(response.statusCode).toBe(400);
        expect(expenseDb.insertExpenseInDb).not.toHaveBeenCalled();
        expect(expenseDb.updateExpenseInDb).not.toHaveBeenCalled();

        await app.close();
      }
    );
  });
});
