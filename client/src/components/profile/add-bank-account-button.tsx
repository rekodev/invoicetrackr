'use client';

import { useTranslations } from 'next-intl';

import AddDialogButton from '@/components/ui/add-dialog-button';

import AddBankAccountDialog from './add-bank-account-dialog';

type Props = {
  userId: number;
  selectedBankAccountId?: number | null;
};

const AddBankAccountButton = ({ userId, selectedBankAccountId }: Props) => {
  const t = useTranslations('profile.banking_information.actions');

  return (
    <AddDialogButton label={t('add')}>
      {({ isOpen, close }) => (
        <AddBankAccountDialog
          userId={userId}
          selectedBankAccountId={selectedBankAccountId}
          isOpen={isOpen}
          onClose={close}
        />
      )}
    </AddDialogButton>
  );
};

export default AddBankAccountButton;
