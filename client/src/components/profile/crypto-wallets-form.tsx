'use client';

import {
  LockClosedIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  cn,
  FieldError,
  Input,
  Label,
  Radio,
  RadioGroup,
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

type Props = {
  userId: number;
  wallets: Array<CryptoWalletBody>;
  isEmbedded?: boolean;
};

const emptyWallet = (isDefault: boolean): CryptoWalletBody => ({
  label: '',
  asset: '',
  network: '',
  address: '',
  memo: '',
  isDefault
});

export default function CryptoWalletsForm({
  userId,
  wallets,
  isEmbedded = false
}: Props) {
  const t = useTranslations('profile.crypto_wallets');
  const defaultWallet = wallets.find((item) => item.isDefault);
  const [selectedWalletId, setSelectedWalletId] = useState(
    String(defaultWallet?.id || wallets.at(0)?.id || '')
  );
  const [wallet, setWallet] = useState<CryptoWalletBody>(() =>
    emptyWallet(!wallets.length)
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [isPending, startTransition] = useTransition();
  const isEditing = Boolean(wallet.id);
  const canSubmit = Boolean(
    wallet.label.trim() &&
      wallet.asset.trim() &&
      wallet.network.trim() &&
      wallet.address.trim()
  );

  const setField = (field: keyof CryptoWalletBody, value: string) => {
    setWallet((current) => ({ ...current, [field]: value }));
    setValidationErrors((current) => ({ ...current, [field]: undefined }));
  };

  const closeEditor = () => {
    setWallet(emptyWallet(!wallets.length));
    setValidationErrors({});
    setIsEditorOpen(false);
  };

  const startAdding = () => {
    setWallet(emptyWallet(!wallets.length));
    setValidationErrors({});
    setIsEditorOpen(true);
  };

  const startEditing = (item: CryptoWalletBody) => {
    setWallet(item);
    setValidationErrors({});
    setIsEditorOpen(true);
  };

  const submit = () =>
    startTransition(async () => {
      const response = isEditing
        ? await updateCryptoWalletAction(userId, wallet)
        : await addCryptoWalletAction(userId, wallet);

      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) {
        setValidationErrors(response.validationErrors || {});
        return;
      }

      closeEditor();
    });

  const saveDefault = () =>
    startTransition(async () => {
      const selected = wallets.find(
        (item) => String(item.id) === selectedWalletId
      );
      if (!selected) return;

      const response = await updateCryptoWalletAction(userId, {
        ...selected,
        isDefault: true
      });
      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });
    });

  const remove = (item: CryptoWalletBody) =>
    startTransition(async () => {
      if (!item.id) return;
      const response = await deleteCryptoWalletAction(userId, item.id);
      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });
      if (wallet.id === item.id) closeEditor();
    });

  const renderWallets = () => {
    if (!wallets.length) {
      return (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <WalletIcon className="text-muted size-10" />
          <div>
            <p className="font-semibold">{t('empty_title')}</p>
            <p className="text-muted mt-1 text-sm">{t('empty_description')}</p>
          </div>
        </div>
      );
    }

    return (
      <RadioGroup
        aria-label={t('select_default')}
        value={selectedWalletId}
        onChange={setSelectedWalletId}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {wallets.map((item) => {
            const isSelected = selectedWalletId === String(item.id);

            return (
              <Card
                key={item.id}
                variant="secondary"
                className={cn('group border pt-0', {
                  'border-accent border-2': isSelected
                })}
              >
                <CardContent className="flex flex-row items-start gap-2 pr-24">
                  <Radio value={String(item.id)} className="min-w-0">
                    <Radio.Control>
                      <Radio.Indicator />
                    </Radio.Control>
                    <Radio.Content>
                      <Label className="text-large font-semibold">
                        {item.label}
                      </Label>
                      <p className="text-xs font-bold uppercase">
                        {item.asset} · {item.network}
                      </p>
                      <small className="text-muted mt-1 break-all">
                        {item.address}
                      </small>
                      {item.memo ? (
                        <small className="text-muted mt-1 block">
                          {t('memo')}: {item.memo}
                        </small>
                      ) : null}
                    </Radio.Content>
                  </Radio>
                  <div className="pointer-events-none absolute right-2 top-2 flex gap-0.5 opacity-0 transition group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="tertiary"
                      aria-label={t('edit')}
                      onPress={() => startEditing(item)}
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      isDisabled={item.isDefault}
                      variant={item.isDefault ? 'tertiary' : 'danger-soft'}
                      aria-label={t('delete')}
                      onPress={() => !item.isDefault && remove(item)}
                    >
                      {item.isDefault ? (
                        <LockClosedIcon className="h-4 w-4" />
                      ) : (
                        <TrashIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </RadioGroup>
    );
  };

  const editor = isEditorOpen ? (
    <Card variant="secondary" className="mt-6 border p-4">
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
              isInvalid={!!validationErrors[field]}
            >
              <Label>{t(`fields.${field}`)}</Label>
              <Input
                value={String(wallet[field] || '')}
                onChange={(event) => setField(field, event.target.value)}
              />
              <FieldError>{validationErrors[field]}</FieldError>
            </TextField>
          )
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button
          variant="danger-soft"
          isDisabled={isPending}
          onPress={closeEditor}
        >
          {t('cancel')}
        </Button>
        <Button isDisabled={!canSubmit} isPending={isPending} onPress={submit}>
          {t(isEditing ? 'save' : 'add')}
        </Button>
      </div>
    </Card>
  ) : null;

  const content = (
    <>
      <div className="flex justify-end px-6 pt-6">
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onPress={startAdding}
        >
          <PlusIcon className="h-4 w-4" />
          {t('add')}
        </Button>
      </div>
      <CardContent className="p-6">
        {renderWallets()}
        {editor}
      </CardContent>
      <CardFooter className="flex justify-end px-6 py-4">
        <Button
          isDisabled={
            !selectedWalletId ||
            selectedWalletId === String(defaultWallet?.id)
          }
          isPending={isPending}
          onPress={saveDefault}
          className="w-full sm:w-auto"
        >
          {t('save_default')}
        </Button>
      </CardFooter>
    </>
  );

  if (isEmbedded) return content;

  return <Card className="w-full border">{content}</Card>;
}
