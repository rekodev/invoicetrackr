'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import ClientFormDialog from './client-form-dialog';

type Props = { userId: number };

const AddClientButton = ({ userId }: Props) => {
  const t = useTranslations('clients.top_content');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" onPress={() => setIsOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        {t('add_new')}
      </Button>
      <ClientFormDialog
        userId={userId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default AddClientButton;
