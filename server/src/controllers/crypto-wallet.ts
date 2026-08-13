import type { CryptoWalletInput } from '@invoicetrackr/types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import {
  deleteCryptoWalletFromDb,
  findCryptoWalletFromDb,
  getCryptoWalletFromDb,
  getCryptoWalletsFromDb,
  insertCryptoWalletInDb,
  updateCryptoWalletInDb
} from '../database/crypto-wallet';
import { recordRequestAudit } from '../utils/audit';
import {
  AlreadyExistsError,
  BadRequestError,
  NotFoundError
} from '../utils/error';

export const getCryptoWallets = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) =>
  reply
    .status(200)
    .send({
      cryptoWallets: await getCryptoWalletsFromDb(Number(req.params.userId))
    });

export const postCryptoWallet = async (
  req: FastifyRequest<{ Params: { userId: string }; Body: CryptoWalletInput }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const userId = Number(req.params.userId);
  if (await findCryptoWalletFromDb(userId, req.body.network, req.body.address))
    throw new AlreadyExistsError(i18n.t('error.cryptoWallet.alreadyExists'));
  const cryptoWallet = await insertCryptoWalletInDb(userId, req.body);
  if (!cryptoWallet)
    throw new BadRequestError(i18n.t('error.cryptoWallet.unableToCreate'));
  await recordRequestAudit({
    req,
    userId,
    action: 'crypto_wallet.created',
    entityType: 'crypto_wallet',
    entityId: cryptoWallet.id,
    newValue: cryptoWallet
  });
  return reply
    .status(201)
    .send({ cryptoWallet, message: i18n.t('success.cryptoWallet.created') });
};

export const updateCryptoWallet = async (
  req: FastifyRequest<{
    Params: { userId: string; id: string };
    Body: CryptoWalletInput;
  }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const userId = Number(req.params.userId);
  const id = Number(req.params.id);
  if (!(await getCryptoWalletFromDb(userId, id)))
    throw new NotFoundError(i18n.t('error.cryptoWallet.notFound'));
  const duplicate = await findCryptoWalletFromDb(
    userId,
    req.body.network,
    req.body.address
  );
  if (duplicate && duplicate.id !== id)
    throw new AlreadyExistsError(i18n.t('error.cryptoWallet.alreadyExists'));
  const cryptoWallet = await updateCryptoWalletInDb(userId, id, req.body);
  if (!cryptoWallet)
    throw new BadRequestError(i18n.t('error.cryptoWallet.unableToUpdate'));
  await recordRequestAudit({
    req,
    userId,
    action: 'crypto_wallet.updated',
    entityType: 'crypto_wallet',
    entityId: id,
    newValue: cryptoWallet
  });
  return reply
    .status(200)
    .send({ cryptoWallet, message: i18n.t('success.cryptoWallet.updated') });
};

export const deleteCryptoWallet = async (
  req: FastifyRequest<{ Params: { userId: string; id: string } }>,
  reply: FastifyReply
) => {
  const i18n = await useI18n(req);
  const userId = Number(req.params.userId);
  const id = Number(req.params.id);
  const wallet = await getCryptoWalletFromDb(userId, id);
  if (!wallet) throw new NotFoundError(i18n.t('error.cryptoWallet.notFound'));
  if (wallet.isDefault)
    throw new BadRequestError(i18n.t('error.cryptoWallet.cannotDeleteDefault'));
  if (!(await deleteCryptoWalletFromDb(userId, id)))
    throw new BadRequestError(i18n.t('error.cryptoWallet.unableToDelete'));
  await recordRequestAudit({
    req,
    userId,
    action: 'crypto_wallet.deleted',
    entityType: 'crypto_wallet',
    entityId: id
  });
  return reply
    .status(200)
    .send({ message: i18n.t('success.cryptoWallet.deleted') });
};
