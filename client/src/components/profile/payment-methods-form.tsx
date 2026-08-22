'use client';

import { BuildingLibraryIcon, WalletIcon } from '@heroicons/react/24/outline';
import {
  Card,
  CardContent,
  Label,
  Radio,
  RadioGroup,
  Separator
} from '@heroui/react';
import type { BankAccount, CryptoWalletBody } from '@invoicetrackr/types';
import type { User } from 'next-auth';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

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
  const [methodType, setMethodType] = useState<PaymentMethodType>('bank');

  return (
    <Card className="w-full border">
      <Card.Header className="px-6 py-4">
        <Card.Title className="text-2xl">{t('title')}</Card.Title>
        <Card.Description className="mt-1">{t('description')}</Card.Description>
      </Card.Header>
      <Separator />
      <CardContent className="px-6 pt-6 pb-0">
        <RadioGroup
          aria-label={t('selector_label')}
          orientation="horizontal"
          variant="secondary"
          value={methodType}
          onChange={(value) => setMethodType(value as PaymentMethodType)}
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
      </CardContent>
      {methodType === 'bank' ? (
        <BankingInformationForm
          user={user}
          bankAccounts={bankAccounts}
          isEmbedded
        />
      ) : (
        <CryptoWalletsForm
          userId={Number(user.id)}
          wallets={cryptoWallets}
          isEmbedded
        />
      )}
    </Card>
  );
}
