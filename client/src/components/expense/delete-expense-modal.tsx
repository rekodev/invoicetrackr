'use client';

import { Button, Modal, toast } from '@heroui/react';
import type { ExpenseBody } from '@invoicetrackr/types';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { deleteExpenseAction } from '@/lib/actions/expense';
import { formatLocalizedDate } from '@/lib/utils/date';

type Props = {
  userId: number;
  expenseData: ExpenseBody;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteExpenseModal = ({
  userId,
  expenseData,
  isOpen,
  onClose
}: Props) => {
  const t = useTranslations('expenses.delete_modal');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () =>
    startTransition(async () => {
      if (!expenseData.id) return;

      const response = await deleteExpenseAction({
        userId,
        expenseId: expenseData.id
      });

      toast(response.message || '', {
        variant: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) return;

      onClose();
    });

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t('title')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {t('description', {
                supplier: expenseData.supplier,
                date:
                  formatLocalizedDate(expenseData.expenseDate, 'lt-LT') || ''
              })}
            </Modal.Body>
            <Modal.Footer>
              <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button
                  className="w-full sm:w-auto"
                  variant="outline"
                  onPress={onClose}
                >
                  {t('cancel')}
                </Button>
                <Button
                  isPending={isPending}
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
    </Modal>
  );
};

export default DeleteExpenseModal;
