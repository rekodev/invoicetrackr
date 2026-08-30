'use client';

import {
  BuildingLibraryIcon,
  PlusIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardContent,
  Label,
  Radio,
  RadioGroup,
  Separator
} from '@heroui/react';
import type { BankAccount, CryptoWalletBody } from '@invoicetrackr/types';
import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ADD_NEW_BANK_ACCOUNT_PAGE } from '@/lib/constants/pages';

import BankingInformationForm from './banking-information-form';
import CryptoWalletsForm from './crypto-wallets-form';

type Props = {
  user: User;
  bankAccounts: Array<Omit<BankAccount, 'id'> & { id?: number }>;
  cryptoWallets: Array<CryptoWalletBody>;
};

type PaymentMethodType = 'bank' | 'crypto';

export default function PaymentMethodsForm({
  user,
  bankAccounts,
  cryptoWallets
}: Props) {
  const t = useTranslations('profile.payment_methods');
  const router = useRouter();
  const [methodType, setMethodType] = useState<PaymentMethodType>('bank');
  const [isCryptoEditorOpen, setIsCryptoEditorOpen] = useState(false);

  const handleAddNew = () => {
    if (methodType === 'bank') {
      router.push(ADD_NEW_BANK_ACCOUNT_PAGE);
      return;
    }

    setIsCryptoEditorOpen(true);
  };

  return (
    <Card className="w-full border">
      <Card.Header className="px-6 py-4">
        <Card.Title className="text-2xl">{t('title')}</Card.Title>
      </Card.Header>
      <Separator />
      <CardContent className="px-6 pb-0 pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <RadioGroup
            aria-label={t('selector_label')}
            orientation="horizontal"
            variant="secondary"
            value={methodType}
            onChange={(value) => {
              setMethodType(value as PaymentMethodType);
              setIsCryptoEditorOpen(false);
            }}
          >
            <Radio value="bank">
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              <Radio.Content>
                <Label className="flex items-center gap-2">
                  <BuildingLibraryIcon className="size-4" />
                  {t('bank_accounts')}
                </Label>
              </Radio.Content>
            </Radio>
            <Radio value="crypto">
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              <Radio.Content>
                <Label className="flex items-center gap-2">
                  <WalletIcon className="size-4" />
                  {t('crypto_wallets')}
                </Label>
              </Radio.Content>
            </Radio>
          </RadioGroup>
          <Button
            variant="secondary"
            className="w-full sm:w-auto"
            onPress={handleAddNew}
          >
            <PlusIcon className="h-4 w-4" />
            {t('add_new')}
          </Button>
        </div>
      </CardContent>
      {methodType === 'bank' ? (
        <BankingInformationForm
          user={user}
          bankAccounts={bankAccounts}
          isEmbedded
          showAddAction={false}
        />
      ) : (
        <CryptoWalletsForm
          userId={Number(user.id)}
          wallets={cryptoWallets}
          isEmbedded
          showAddAction={false}
          isEditorOpen={isCryptoEditorOpen}
          onEditorOpenChange={setIsCryptoEditorOpen}
        />
      )}
    </Card>
  );
}
