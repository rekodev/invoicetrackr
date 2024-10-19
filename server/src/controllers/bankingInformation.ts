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
import { transformBankAccountDto } from '../types/transformers';
import { UserDto } from '../types/dtos';
import { BadRequestError } from '../utils/errors';

export const getBankAccounts = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;

  const bankAccounts = await getBankAccountsFromDb(userId);
  reply.send(bankAccounts.map((account) => transformBankAccountDto(account)));
};

export const getBankAccount = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const bankAccount = await getBankAccountFromDb(userId, id);

  if (!bankAccount)
    return reply.status(404).send({ message: 'Bank account not found' });

  return reply.send(transformBankAccountDto(bankAccount));
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
    return reply.status(403).send({
      message: 'Bank account with provided account number already exists',
    });

  const insertedBankAccount = await insertBankAccountInDb(
    userId,
    bankAccountData
  );

  if (!insertedBankAccount)
    return reply.status(400).send({ message: 'Unable to add bank account' });

  if (!hasSelectedBankAccount) {
    const updatedUserSelectedBankAccount =
      await updateUserSelectedBankAccountInDb(userId, insertedBankAccount.id);

    if (!updatedUserSelectedBankAccount)
      return reply.status(200).send({
        bankAccount: transformBankAccountDto(insertedBankAccount),
        message:
          'Bank account added succesfully. Please select it as your main account.',
      });
  }

  return reply.send({
    bankAccount: transformBankAccountDto(insertedBankAccount),
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

  if (!bankAccount)
    return reply.status(400).send({ message: 'Unable to update bank account' });

  return reply.send({
    bankAccount: transformBankAccountDto(bankAccount),
    message: 'Bank account updated successfully',
  });
};

export const deleteBankAccount = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;

  const [user] = await getUserFromDb(userId);

  if ((user as UserDto)?.selected_bank_account_id === Number(id))
    throw new BadRequestError('Cannot delete selected bank account');

  const bankAccount = await deleteBankAccountFromDb(userId, id);

  if (!bankAccount)
    return reply.status(400).send({ message: 'Unable to delete bank account' });

  return reply.send({ message: 'Bank account deleted successfully' });
};
