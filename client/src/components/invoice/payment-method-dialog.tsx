'use client';

import {
  BuildingLibraryIcon,
  PlusCircleIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardContent,
  FieldError,
  Input,
  Label,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  toast
} from '@heroui/react';
import type { BankAccountBody, CryptoWalletBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { type ReactNode, useState, useTransition } from 'react';

import { addCryptoWalletAction } from '@/lib/actions/crypto-wallet';

import BankAccountForm from '../profile/bank-account-form';

export type PaymentMethodSelection =
  | { type: 'manual'; bankAccount: BankAccountBody }
  | { type: 'crypto'; cryptoWallet: CryptoWalletBody };

type DialogView = 'list' | 'add';
type PaymentMethodType = 'bank' | 'crypto';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (_selection: PaymentMethodSelection) => void;
  bankAccounts: Array<BankAccountBody>;
  cryptoWallets: Array<CryptoWalletBody>;
};

const emptyCryptoWallet = (isDefault: boolean): CryptoWalletBody => ({
  label: '',
  asset: '',
  network: '',
  address: '',
  memo: '',
  isDefault
});

export default function PaymentMethodDialog({
  userId,
  isOpen,
  onClose,
  onSelect,
  bankAccounts,
  cryptoWallets
}: Props) {
  const t = useTranslations('components.invoice_form');
  const tWallet = useTranslations('profile.crypto_wallets');
  const [view, setView] = useState<DialogView>('list');
  const [paymentMethodType, setPaymentMethodType] =
    useState<PaymentMethodType>('bank');
  const [wallet, setWallet] = useState<CryptoWalletBody>(() =>
    emptyCryptoWallet(!cryptoWallets.length)
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [isPending, startTransition] = useTransition();

  const reset = () => {
    setView('list');
    setPaymentMethodType('bank');
    setWallet(emptyCryptoWallet(!cryptoWallets.length));
    setValidationErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const selectBankAccount = (bankAccount: BankAccountBody) =>
    onSelect({ type: 'manual', bankAccount });

  const selectCryptoWallet = (cryptoWallet: CryptoWalletBody) =>
    onSelect({ type: 'crypto', cryptoWallet });

  const createCryptoWallet = () =>
    startTransition(async () => {
      const response = await addCryptoWalletAction(userId, wallet);
      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) {
        setValidationErrors(response.validationErrors || {});
        return;
      }

      if (response.data?.cryptoWallet)
        selectCryptoWallet(response.data.cryptoWallet);
    });

  const renderPaymentMethod = ({
    key,
    icon,
    title,
    details,
    onPress
  }: {
    key: string;
    icon: ReactNode;
    title: string;
    details: ReactNode;
    onPress: () => void;
  }) => (
    <button
      key={key}
      type="button"
      className="block w-full shrink-0 text-left"
      onClick={onPress}
    >
      <Card className="hover:bg-muted/5 h-auto shrink-0 border hover:cursor-pointer">
        <CardContent className="flex w-full flex-row items-start justify-between gap-4 text-left">
          <div className="flex min-w-0 flex-row items-start gap-3 text-left">
            <div className="border-default-200 bg-muted/5 flex shrink-0 rounded-md border p-2">
              {icon}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-bold">{title}</p>
              <div className="text-muted flex min-w-0 flex-wrap gap-x-2 gap-y-0.5 text-xs">
                {details}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </button>
  );

  const renderList = () => {
    if (!bankAccounts.length && !cryptoWallets.length)
      return <p className="text-muted">{t('modals.no_payment_methods')}</p>;

    return (
      <div className="flex max-h-[60vh] flex-col items-stretch justify-start gap-2 overflow-y-auto pr-1">
        {bankAccounts.map((bankAccount) =>
          renderPaymentMethod({
            key: `bank-${bankAccount.id}`,
            icon: <BuildingLibraryIcon className="h-5 w-5" />,
            title: bankAccount.name,
            details: (
              <>
                <span>{bankAccount.code}</span>
                <span className="break-all">{bankAccount.accountNumber}</span>
              </>
            ),
            onPress: () => selectBankAccount(bankAccount)
          })
        )}
        {cryptoWallets.map((cryptoWallet) =>
          renderPaymentMethod({
            key: `crypto-${cryptoWallet.id}`,
            icon: <WalletIcon className="h-5 w-5" />,
            title: cryptoWallet.label,
            details: (
              <>
                <span>{cryptoWallet.asset}</span>
                <span>{cryptoWallet.network}</span>
                <span className="break-all">{cryptoWallet.address}</span>
              </>
            ),
            onPress: () => selectCryptoWallet(cryptoWallet)
          })
        )}
      </div>
    );
  };

  const renderCryptoWalletForm = () => {
    const canSubmit = Boolean(
      wallet.label.trim() &&
        wallet.asset.trim() &&
        wallet.network.trim() &&
        wallet.address.trim()
    );

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {(['label', 'asset', 'network', 'address', 'memo'] as const).map(
          (field) => (
            <TextField
              key={field}
              variant="secondary"
              className={field === 'address' ? 'md:col-span-2' : ''}
              isInvalid={!!validationErrors[field]}
            >
              <Label>{tWallet(`fields.${field}`)}</Label>
              <Input
                value={String(wallet[field] || '')}
                onChange={(event) => {
                  setWallet((current) => ({
                    ...current,
                    [field]: event.target.value
                  }));
                  setValidationErrors((current) => ({
                    ...current,
                    [field]: undefined
                  }));
                }}
              />
              <FieldError>{validationErrors[field]}</FieldError>
            </TextField>
          )
        )}
        <div className="flex gap-2 md:col-span-2 md:justify-end">
          <Button variant="danger-soft" onPress={() => setView('list')}>
            {tWallet('cancel')}
          </Button>
          <Button
            isDisabled={!canSubmit}
            isPending={isPending}
            onPress={createCryptoWallet}
          >
            {tWallet('add')}
          </Button>
        </div>
      </div>
    );
  };

  const renderAddPaymentMethod = () => (
    <div className="flex flex-col gap-5">
      <RadioGroup
        aria-label={t('modals.payment_method_type')}
        orientation="horizontal"
        variant="secondary"
        value={paymentMethodType}
        onChange={(value) => {
          setPaymentMethodType(value as PaymentMethodType);
          setValidationErrors({});
        }}
      >
        <Radio value="bank">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>{t('modals.bank_account')}</Label>
          </Radio.Content>
        </Radio>
        <Radio value="crypto">
          <Radio.Control>
            <Radio.Indicator />
          </Radio.Control>
          <Radio.Content>
            <Label>{t('modals.crypto_wallet')}</Label>
          </Radio.Content>
        </Radio>
      </RadioGroup>
      {paymentMethodType === 'bank' ? (
        <BankAccountForm
          userId={userId}
          variant="inline"
          shouldSelectOnCreate={!bankAccounts.length}
          onCancel={() => setView('list')}
          onSuccess={(bankAccount) =>
            bankAccount && selectBankAccount(bankAccount)
          }
        />
      ) : (
        renderCryptoWalletForm()
      )}
    </div>
  );

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && handleClose()}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {t(
                  view === 'add'
                    ? 'modals.add_payment_method'
                    : 'modals.select_payment_method'
                )}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="justify-start">
              {view === 'add' ? renderAddPaymentMethod() : renderList()}
            </Modal.Body>
            {view === 'list' ? (
              <Modal.Footer>
                <Button
                  className="w-full sm:w-auto"
                  onPress={() => setView('add')}
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  {t('modals.add_payment_method')}
                </Button>
              </Modal.Footer>
            ) : null}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
