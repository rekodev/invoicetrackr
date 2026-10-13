'use client';

import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Alert, Button, buttonVariants } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import SectionHeading from '@/components/ui/section-heading';
import { accountDataExportHref } from '@/lib/utils/account-data';

import DeleteAccountModal from './delete-account-modal';

type Props = {
  userId: number;
  email: string;
  hasExportError?: boolean;
};

const AccountDataSection = ({ userId, email, hasExportError }: Props) => {
  const t = useTranslations('profile.account.data');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const renderRow = (
    key: 'export' | 'delete',
    action: React.ReactNode
  ) => (
    <div className="flex flex-col gap-field py-card first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-field-content">
        <p className="text-sm font-medium">{t(`${key}.title`)}</p>
        <p className="text-muted text-sm">{t(`${key}.description`)}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );

  return (
    <section className="gap-heading flex flex-col">
      <SectionHeading title={t('title')} />
      {hasExportError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>{t('export.error')}</Alert.Title>
          </Alert.Content>
        </Alert>
      ) : null}
      <div className="divide-y">
        {renderRow(
          'export',
          <a
            href={accountDataExportHref}
            className={buttonVariants({ variant: 'outline' })}
          >
            <ArrowDownTrayIcon className="size-4" />
            {t('export.action')}
          </a>
        )}
        {renderRow(
          'delete',
          <Button
            variant="danger-soft"
            onPress={() => setIsDeleteModalOpen(true)}
          >
            {t('delete.action')}
          </Button>
        )}
      </div>
      <DeleteAccountModal
        userId={userId}
        email={email}
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </section>
  );
};

export default AccountDataSection;
