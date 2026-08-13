import type {
  CryptoWalletBody,
  GetCryptoWalletsResponse,
  MessageResponse,
  PostCryptoWalletResponse,
  UpdateCryptoWalletResponse
} from '@invoicetrackr/types';

import api from './api-instance';

export const getCryptoWallets = (userId: number) =>
  api.get<GetCryptoWalletsResponse>(`/api/${userId}/crypto-wallets`);
export const addCryptoWallet = (userId: number, wallet: CryptoWalletBody) =>
  api.post<PostCryptoWalletResponse>(`/api/${userId}/crypto-wallets`, wallet);
export const updateCryptoWallet = (userId: number, wallet: CryptoWalletBody) =>
  api.put<UpdateCryptoWalletResponse>(
    `/api/${userId}/crypto-wallets/${wallet.id}`,
    wallet
  );
export const deleteCryptoWallet = (userId: number, id: number) =>
  api.delete<MessageResponse>(`/api/${userId}/crypto-wallets/${id}`);
