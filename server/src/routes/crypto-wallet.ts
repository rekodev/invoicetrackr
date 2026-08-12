import type {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyPluginOptions
} from 'fastify';

import {
  deleteCryptoWalletOptions,
  getCryptoWalletsOptions,
  postCryptoWalletOptions,
  updateCryptoWalletOptions
} from '../options/crypto-wallet';

export default function cryptoWalletRoutes(
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
  done: DoneFuncWithErrOrRes
) {
  fastify.get('/api/:userId/crypto-wallets', getCryptoWalletsOptions);
  fastify.post('/api/:userId/crypto-wallets', postCryptoWalletOptions);
  fastify.put('/api/:userId/crypto-wallets/:id', updateCryptoWalletOptions);
  fastify.delete('/api/:userId/crypto-wallets/:id', deleteCryptoWalletOptions);
  done();
}
