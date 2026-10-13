'use client';

import { useTranslations } from 'next-intl';

import AddDialogButton from '@/components/ui/add-dialog-button';

import ClientFormDialog from './client-form-dialog';

type Props = { userId: number };

const AddClientButton = ({ userId }: Props) => {
  const t = useTranslations('clients.top_content');

  return (
    <AddDialogButton label={t('add_new')}>
      {({ isOpen, close }) => (
        <ClientFormDialog userId={userId} isOpen={isOpen} onClose={close} />
      )}
    </AddDialogButton>
  );
};

export default AddClientButton;
