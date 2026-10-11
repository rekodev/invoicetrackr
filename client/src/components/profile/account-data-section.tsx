'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Alert, Button, buttonVariants, Card } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { accountDataExportHref } from '@/lib/utils/account-data';

import DeleteAccountModal from './delete-account-modal';

type Props = {
  userId: number;
  email: string;
  hasExportError?: boolean;
};

const AccountDataSection = ({ userId, email, hasExportError }: Props) => {
  const t = useTranslations('profile.account_settings.data');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const renderRow = (
    key: 'export' | 'delete',
    action: React.ReactNode
  ) => (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{t(`${key}.title`)}</p>
        <p className="text-muted text-sm">{t(`${key}.description`)}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );

  return (
    <Card className="w-full border">
      <Card.Header className="flex flex-col gap-1 px-6 pt-6">
        <h2 className="text-lg font-medium">{t('title')}</h2>
        <p className="text-muted text-sm">{t('description')}</p>
      </Card.Header>
      <Card.Content className="divide-y px-6 pb-2">
        {hasExportError ? (
          <Alert status="danger" className="mb-4">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{t('export.error')}</Alert.Title>
            </Alert.Content>
          </Alert>
        ) : null}
        {renderRow(
          'export',
          <a
            href={accountDataExportHref}
            className={buttonVariants({ size: 'sm', variant: 'outline' })}
          >
            <ArrowDownTrayIcon className="size-4" />
            {t('export.action')}
          </a>
        )}
        {renderRow(
          'delete',
          <Button
            size="sm"
            variant="danger-soft"
            onPress={() => setIsDeleteModalOpen(true)}
          >
            {t('delete.action')}
          </Button>
        )}
      </Card.Content>
      <DeleteAccountModal
        userId={userId}
        email={email}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </Card>
  );
};

export default AccountDataSection;
