'use client';

import { useTranslations } from 'next-intl';

import AddDialogButton from '@/components/ui/add-dialog-button';

import ExpenseFormDialog from './expense-form-dialog';

type Props = { userId: number };

const AddExpenseButton = ({ userId }: Props) => {
  const t = useTranslations('expenses');

  return (
    <AddDialogButton label={t('top_content.add_new')}>
      {({ isOpen, close }) => (
        <ExpenseFormDialog
          userId={userId}
          isOpen={isOpen}
          onClose={close}
          mode="add"
        />
      )}
    </AddDialogButton>
  );
};

export default AddExpenseButton;
