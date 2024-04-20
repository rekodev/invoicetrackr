import { BankAccountDto } from '../dtos';
import { BankAccountModel } from '../models';

export const transformBankAccountDto = (
  bankAccountDto: BankAccountDto
): BankAccountModel => {
  const { account_number, code, id, name } = bankAccountDto;

  return {
    id,
    name,
    code,
    accountNumber: account_number,
  };
};
