'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import ExpenseFormDialog from './expense-form-dialog';

type Props = { userId: number };

const AddExpenseButton = ({ userId }: Props) => {
  const t = useTranslations('expenses');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" onPress={() => setIsOpen(true)}>
        <PlusIcon className="h-4 w-4" />
        {t('top_content.add_new')}
      </Button>
      <ExpenseFormDialog
        userId={userId}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="add"
      />
    </>
  );
};

export default AddExpenseButton;
