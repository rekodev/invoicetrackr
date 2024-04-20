import { FastifyReply, FastifyRequest } from 'fastify';
import { BankAccountModel } from '../types/models';
import {
  deleteBankAccountFromDb,
  findBankAccountByAccountNumber,
  getBankAccountFromDb,
  getBankAccountsFromDb,
  insertBankAccountInDb,
  updateBankAccountInDb,
} from '../database';
import { transformBankAccountDto } from '../types/transformers';

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
    Body: Omit<BankAccountModel, 'id'>;
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const bankAccountData = req.body;

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

  const bankAccount = await deleteBankAccountFromDb(userId, id);

  if (!bankAccount)
    return reply.status(400).send({ message: 'Unable to delete bank account' });

  return reply.send({ message: 'Bank account deleted successfully' });
};
