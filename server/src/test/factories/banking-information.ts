import { BankAccount } from '@invoicetrackr/types';
import { Factory } from 'fishery';

export const bankingInformationFactory = Factory.define<BankAccount>(
  ({ sequence }) => ({
    id: sequence,
    name: `Bank Account ${sequence}`,
    code: `BANK${sequence}`,
    accountNumber: `ACC${sequence}`,
    userId: 1
  })
);
