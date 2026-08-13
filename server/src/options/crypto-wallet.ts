import {
  cryptoWalletInputSchema,
  getCryptoWalletsResponseSchema,
  messageResponseSchema,
  postCryptoWalletResponseSchema,
  updateCryptoWalletResponseSchema
} from '@invoicetrackr/types';
import type { RouteShorthandOptionsWithHandler } from 'fastify';

import {
  deleteCryptoWallet,
  getCryptoWallets,
  postCryptoWallet,
  updateCryptoWallet
} from '../controllers/crypto-wallet';
import { authMiddleware } from '../middleware/auth';

const auth = [authMiddleware];
export const getCryptoWalletsOptions: RouteShorthandOptionsWithHandler = {
  schema: { response: { 200: getCryptoWalletsResponseSchema } },
  preHandler: auth,
  handler: getCryptoWallets
};
export const postCryptoWalletOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: cryptoWalletInputSchema,
    response: { 201: postCryptoWalletResponseSchema }
  },
  preHandler: auth,
  handler: postCryptoWallet
};
export const updateCryptoWalletOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    body: cryptoWalletInputSchema,
    response: { 200: updateCryptoWalletResponseSchema }
  },
  preHandler: auth,
  handler: updateCryptoWallet
};
export const deleteCryptoWalletOptions: RouteShorthandOptionsWithHandler = {
  schema: { response: { 200: messageResponseSchema } },
  preHandler: auth,
  handler: deleteCryptoWallet
};
