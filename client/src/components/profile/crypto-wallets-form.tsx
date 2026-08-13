'use client';

import {
  Button,
  Card,
  CardContent,
  FieldError,
  Input,
  Label,
  TextField,
  toast
} from '@heroui/react';
import type { CryptoWalletBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import {
  addCryptoWalletAction,
  deleteCryptoWalletAction,
  updateCryptoWalletAction
} from '@/lib/actions/crypto-wallet';

type Props = { userId: number; wallets: Array<CryptoWalletBody> };

const EMPTY_WALLET: CryptoWalletBody = {
  label: '',
  asset: '',
  network: '',
  address: '',
  memo: '',
  isDefault: false
};

export default function CryptoWalletsForm({ userId, wallets }: Props) {
  const t = useTranslations('profile.crypto_wallets');
  const [wallet, setWallet] = useState<CryptoWalletBody>(EMPTY_WALLET);
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(wallet.id);
  const canSubmit = Boolean(
    wallet.label.trim() &&
      wallet.asset.trim() &&
      wallet.network.trim() &&
      wallet.address.trim()
  );

  const setField = (field: keyof CryptoWalletBody, value: string | boolean) =>
    setWallet((current) => ({ ...current, [field]: value }));

  const reset = () => setWallet(EMPTY_WALLET);

  const submit = () =>
    startTransition(async () => {
      const response = isEditing
        ? await updateCryptoWalletAction(userId, wallet)
        : await addCryptoWalletAction(userId, wallet);
      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });
      if (response.ok) reset();
    });

  const remove = (id: number) =>
    startTransition(async () => {
      const response = await deleteCryptoWalletAction(userId, id);
      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });
      if (wallet.id === id) reset();
    });

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-muted text-sm">{t('description')}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {wallets.map((item) => (
          <Card key={item.id} variant="secondary" className="border">
            <CardContent className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-semibold">
                  {item.label}
                  {item.isDefault ? ` · ${t('default')}` : ''}
                </p>
                <p className="text-muted text-sm">
                  {item.asset} · {item.network}
                </p>
                <p className="mt-1 break-all text-sm">{item.address}</p>
                {item.memo ? (
                  <p className="text-muted text-sm">
                    {t('memo')}: {item.memo}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  isDisabled={isPending}
                  onPress={() => setWallet(item)}
                >
                  {t('edit')}
                </Button>
                <Button
                  size="sm"
                  variant="danger-soft"
                  isDisabled={item.isDefault || isPending}
                  onPress={() => item.id && remove(item.id)}
                >
                  {t('delete')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card variant="secondary" className="border p-4">
        <h3 className="mb-4 font-semibold">
          {t(isEditing ? 'edit_title' : 'add_title')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {(['label', 'asset', 'network', 'address', 'memo'] as const).map(
            (field) => (
              <TextField
                key={field}
                variant="secondary"
                className={field === 'address' ? 'md:col-span-2' : ''}
              >
                <Label>{t(`fields.${field}`)}</Label>
                <Input
                  value={String(wallet[field] || '')}
                  onChange={(event) => setField(field, event.target.value)}
                />
                <FieldError />
              </TextField>
            )
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!wallet.isDefault}
              onChange={(event) => setField('isDefault', event.target.checked)}
            />
            {t('use_default')}
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button
            isDisabled={!canSubmit}
            isPending={isPending}
            onPress={submit}
          >
            {t(isEditing ? 'save' : 'add')}
          </Button>
          {isEditing ? (
            <Button variant="ghost" isDisabled={isPending} onPress={reset}>
              {t('cancel')}
            </Button>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
