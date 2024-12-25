import { FastifyReply, FastifyRequest } from 'fastify';
import { BankAccountModel } from '../types/models';
import {
  deleteBankAccountFromDb,
  findBankAccountByAccountNumber,
  getBankAccountFromDb,
  getBankAccountsFromDb,
  getUserFromDb,
  insertBankAccountInDb,
  updateBankAccountInDb,
  updateUserSelectedBankAccountInDb,
} from '../database';
import {
  AlreadyExistsError,
  BadRequestError,
  NotFoundError,
} from '../utils/errors';

export const getBankAccounts = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;

  const bankAccounts = await getBankAccountsFromDb(userId);

  reply.status(200).send(bankAccounts);
};

export const getBankAccount = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const bankAccount = await getBankAccountFromDb(userId, id);

  if (!bankAccount) throw new NotFoundError('Bank account not found');

  reply.status(200).send(bankAccount);
};

export const postBankAccount = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: Omit<BankAccountModel, 'id'> & { hasSelectedBankAccount: boolean };
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const bankAccountData = req.body;
  const { hasSelectedBankAccount } = bankAccountData;

  const foundBankAccount = await findBankAccountByAccountNumber(
    userId,
    bankAccountData.accountNumber
  );

  if (foundBankAccount)
    throw new AlreadyExistsError(
      'Bank account with provided account number already exists'
    );

  const insertedBankAccount = await insertBankAccountInDb(
    userId,
    bankAccountData
  );

  if (!insertedBankAccount)
    throw new BadRequestError('Unable to add bank account');

  if (!hasSelectedBankAccount) {
    const updatedUserSelectedBankAccount =
      await updateUserSelectedBankAccountInDb(userId, insertedBankAccount.id);

    if (!updatedUserSelectedBankAccount)
      return reply.status(200).send({
        bankAccount: updatedUserSelectedBankAccount,
        message:
          'Bank account added succesfully. Please select it as your main account.',
      });
  }

  return reply.status(200).send({
    bankAccount: insertedBankAccount,
    message: 'Bank account added successfully',
  });
};

export const updateBankAccount = async (
  req: FastifyRequest<{
    Params: { userId: number; id: number };
    Body: BankAccountModel;
  }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;
  const bankAccountData = req.body;

  const bankAccount = await updateBankAccountInDb(userId, id, bankAccountData);

  if (!bankAccount) throw new BadRequestError('Unable to update bank account');

  reply.status(200).send({
    bankAccount,
    message: 'Bank account updated successfully',
  });
};

export const deleteBankAccount = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;
  const user = await getUserFromDb(userId);

  if (user.selectedBankAccountId === Number(id))
    throw new BadRequestError('Cannot delete selected bank account');

  const bankAccount = await deleteBankAccountFromDb(userId, id);

  if (!bankAccount) throw new BadRequestError('Unable to delete bank account');

  return reply.send({ message: 'Bank account deleted successfully' });
};
