import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  addBankingInformation,
  deleteBankingInformation,
  updateBankingInformation
} from '@/api/banking-information';
import {
  BANKING_INFORMATION_PAGE,
  PAYMENT_METHODS_PAGE
} from '@/lib/constants/pages';

import {
  addBankingInformationAction,
  deleteBankingInformationAction,
  updateBankingInformationAction
} from '../banking-information';

vi.mock('@/api/banking-information', () => ({
  addBankingInformation: vi.fn(),
  deleteBankingInformation: vi.fn(),
  updateBankingInformation: vi.fn()
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

const bankAccount = {
  id: 3,
  name: 'Test Bank',
  code: 'TESTLT21',
  accountNumber: 'LT121000011101001000'
};

describe('banking information actions', () => {
  beforeEach(() => {
    const response = { data: { message: 'Saved' } } as never;
    vi.mocked(addBankingInformation).mockResolvedValue({
      data: { message: 'Saved', bankAccount }
    } as never);
    vi.mocked(updateBankingInformation).mockResolvedValue(response);
    vi.mocked(deleteBankingInformation).mockResolvedValue(response);
  });

  it.each([
    {
      name: 'add',
      action: () => addBankingInformationAction(1, bankAccount, false)
    },
    {
      name: 'update',
      action: () => updateBankingInformationAction(1, bankAccount)
    },
    {
      name: 'delete',
      action: () => deleteBankingInformationAction(1, bankAccount.id)
    }
  ])(
    'revalidates payment methods after a bank account $name',
    async ({ action }) => {
      await action();

      expect(revalidatePath).toHaveBeenCalledWith(BANKING_INFORMATION_PAGE);
      expect(revalidatePath).toHaveBeenCalledWith(PAYMENT_METHODS_PAGE);
    }
  );
});
