'use client';

import { Button, Modal, toast } from '@heroui/react';
import type { ExpenseBody } from '@invoicetrackr/types';
import { useLocale, useTranslations } from 'next-intl';
import { useRef, useState, useTransition } from 'react';

import { deleteExpenseAction } from '@/lib/actions/expense';
import { formatLocalizedDate } from '@/lib/utils/date';

type Props = {
  userId: number;
  expenseData: ExpenseBody;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: () => void;
};

const DeleteExpenseModal = ({
  userId,
  expenseData,
  isOpen,
  onClose,
  onDeleted
}: Props) => {
  const t = useTranslations('expenses.delete_modal');
  const general = useTranslations();
  const locale = useLocale();
  const [error, setError] = useState('');
  const busy = useRef(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!expenseData.id || busy.current) return;
    busy.current = true;
    startTransition(async () => {
      setError('');
      try {
        const response = await deleteExpenseAction({ userId, expenseId: expenseData.id! });
        if (!response.ok) { setError(response.message); return; }
        toast(response.message, { variant: 'success' });
        onDeleted?.();
        onClose();
      } catch {
        setError(general('general_error'));
      } finally {
        busy.current = false;
      }
    });
  };

  return (
    <Modal.Backdrop isOpen={isOpen} isDismissable={!isPending} isKeyboardDismissDisabled={isPending}
      onOpenChange={(open) => !open && !isPending && onClose()}>
      <Modal.Container>
        <Modal.Dialog>
          {!isPending ? <Modal.CloseTrigger /> : null}
          <Modal.Header>
            <Modal.Heading>{t('title')}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            {t('description', {
              supplier: expenseData.supplier,
              date: formatLocalizedDate(expenseData.expenseDate, locale) || ''
            })}
            {error ? <p role="alert" className="text-danger mt-2 text-sm">{error}</p> : null}
          </Modal.Body>
          <Modal.Footer>
            <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
              <Button
                className="w-full sm:w-auto"
                isDisabled={isPending}
                variant="outline"
                onPress={onClose}
              >
                {t('cancel')}
              </Button>
              <Button
                isPending={isPending}
                isDisabled={isPending}
                variant="danger"
                className="w-full sm:w-auto"
                onPress={handleSubmit}
              >
                {t('confirm')}
              </Button>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default DeleteExpenseModal;
