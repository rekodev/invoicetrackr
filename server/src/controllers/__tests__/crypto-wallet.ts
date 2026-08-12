import { describe, expect, it, vi } from 'vitest';

import * as cryptoWalletDb from '../../database/crypto-wallet';
import {
  postCryptoWalletOptions,
  updateCryptoWalletOptions
} from '../../options/crypto-wallet';
import { createTestApp, mockAuthMiddleware } from '../../test/app';

vi.mock('../../database/crypto-wallet');

describe('Crypto Wallet Controller', () => {
  const testUserId = 1;
  const wallet = {
    id: 1,
    label: 'Business wallet',
    asset: 'USDC',
    network: 'Polygon',
    address: '0x1234567890',
    memo: null,
    isDefault: true
  };

  it('normalizes and saves a valid wallet', async () => {
    vi.mocked(cryptoWalletDb.findCryptoWalletFromDb).mockResolvedValue(
      undefined
    );
    vi.mocked(cryptoWalletDb.insertCryptoWalletInDb).mockResolvedValue(wallet);

    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/crypto-wallets', {
        ...postCryptoWalletOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'POST',
      url: `/api/${testUserId}/crypto-wallets`,
      payload: {
        label: ' Business wallet ',
        asset: ' usdc ',
        network: 'Polygon',
        address: '0x1234567890',
        isDefault: true
      }
    });

    expect(response.statusCode).toBe(201);
    expect(cryptoWalletDb.insertCryptoWalletInDb).toHaveBeenCalledWith(
      testUserId,
      expect.objectContaining({
        label: 'Business wallet',
        asset: 'USDC',
        network: 'Polygon',
        address: '0x1234567890',
        isDefault: true
      })
    );

    await app.close();
  });

  it('rejects incomplete wallet details before database mutation', async () => {
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/crypto-wallets', {
        ...postCryptoWalletOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'POST',
      url: `/api/${testUserId}/crypto-wallets`,
      payload: {
        label: 'Business wallet',
        asset: 'USDC',
        network: '',
        address: ''
      }
    });

    expect(response.statusCode).toBe(400);
    expect(cryptoWalletDb.insertCryptoWalletInDb).not.toHaveBeenCalled();

    await app.close();
  });

  it('rejects updating a wallet to duplicate another saved wallet', async () => {
    vi.mocked(cryptoWalletDb.getCryptoWalletFromDb).mockResolvedValue(wallet);
    vi.mocked(cryptoWalletDb.findCryptoWalletFromDb).mockResolvedValue({
      id: 2
    });

    const app = await createTestApp((fastifyApp) => {
      fastifyApp.put('/api/:userId/crypto-wallets/:id', {
        ...updateCryptoWalletOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'PUT',
      url: `/api/${testUserId}/crypto-wallets/1`,
      payload: wallet
    });

    expect(response.statusCode).toBe(403);
    expect(cryptoWalletDb.updateCryptoWalletInDb).not.toHaveBeenCalled();

    await app.close();
  });
});
