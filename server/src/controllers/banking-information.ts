import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';
import { BankAccountType } from '../types/banking-information';
import {
  deleteBankAccountFromDb,
  findBankAccountByAccountNumber,
  getBankAccountFromDb,
  getBankAccountsFromDb,
  insertBankAccountInDb,
  updateBankAccountInDb
} from '../database/banking-information';
import {
  getUserFromDb,
  updateUserSelectedBankAccountInDb
} from '../database/user';
import {
  AlreadyExistsError,
  BadRequestError,
  NotFoundError
} from '../utils/error';

export const getBankAccounts = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;

  const bankAccounts = await getBankAccountsFromDb(userId);

  reply.status(200).send({ bankAccounts });
};

export const getBankAccount = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;
  const i18n = await useI18n(req);

  const bankAccount = await getBankAccountFromDb(userId, id);

  if (!bankAccount)
    throw new NotFoundError(i18n.t('error.bankAccount.notFound'));

  reply.status(200).send({ bankAccount });
};

export const postBankAccount = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: Omit<BankAccountType, 'id'> & { hasSelectedBankAccount: boolean };
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const bankAccountData = req.body;
  const { hasSelectedBankAccount } = bankAccountData;
  const i18n = await useI18n(req);

  const foundBankAccount = await findBankAccountByAccountNumber(
    userId,
    bankAccountData.accountNumber
  );

  if (foundBankAccount)
    throw new AlreadyExistsError(i18n.t('error.bankAccount.alreadyExists'));

  const insertedBankAccount = await insertBankAccountInDb(
    userId,
    bankAccountData
  );

  if (!insertedBankAccount)
    throw new BadRequestError(i18n.t('error.bankAccount.unableToCreate'));

  if (!hasSelectedBankAccount) {
    const updatedUserSelectedBankAccount =
      await updateUserSelectedBankAccountInDb(userId, insertedBankAccount.id);

    if (!updatedUserSelectedBankAccount)
      return reply.status(200).send({
        bankAccount: updatedUserSelectedBankAccount,
        message: i18n.t('success.bankAccount.createdWithWarning')
      });
  }

  return reply.status(200).send({
    bankAccount: insertedBankAccount,
    message: i18n.t('success.bankAccount.created')
  });
};

export const updateBankAccount = async (
  req: FastifyRequest<{
    Params: { userId: number; id: number };
    Body: BankAccountType;
  }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;
  const bankAccountData = req.body;
  const i18n = await useI18n(req);

  const bankAccount = await updateBankAccountInDb(userId, id, bankAccountData);

  if (!bankAccount)
    throw new BadRequestError(i18n.t('error.bankAccount.unableToUpdate'));

  reply.status(200).send({
    bankAccount,
    message: i18n.t('success.bankAccount.updated')
  });
};

export const deleteBankAccount = async (
  req: FastifyRequest<{ Params: { userId: number; id: number } }>,
  reply: FastifyReply
) => {
  const { userId, id } = req.params;
  const i18n = await useI18n(req);
  const user = await getUserFromDb(userId);

  if (user?.selectedBankAccountId === Number(id))
    throw new BadRequestError(i18n.t('error.bankAccount.cannotDeleteSelected'));

  const bankAccount = await deleteBankAccountFromDb(userId, id);

  if (!bankAccount)
    throw new BadRequestError(i18n.t('error.bankAccount.unableToDelete'));

  return reply.send({ message: i18n.t('success.bankAccount.deleted') });
};
