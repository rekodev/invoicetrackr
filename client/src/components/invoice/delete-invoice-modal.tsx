import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  toast
} from '@heroui/react';
import { AppModal } from '@/components/ui/app-modal';
import { InvoiceBody } from '@invoicetrackr/types';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { deleteInvoiceAction } from '@/lib/actions/invoice';

type Props = {
  userId: number;
  invoiceData: InvoiceBody;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteInvoiceModal = ({
  userId,
  isOpen,
  onClose,
  invoiceData
}: Props) => {
  const t = useTranslations('invoices.delete_modal');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () =>
    startTransition(async () => {
      const response = await deleteInvoiceAction({
        userId,
        invoiceId: Number(invoiceData.id)
      });

      toast(response.message, { variant: response.ok ? 'success' : 'danger' });

      if (!response.ok) return;

      onClose();
    });

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button variant="outline" onPress={onClose}>
            {t('cancel')}
          </Button>
          <Button isPending={isPending} variant="danger" onPress={handleSubmit}>
            {t('confirm')}
          </Button>
        </div>
      </div>
    </ModalFooter>
  );

  return (
    <AppModal isOpen={isOpen} onClose={onClose}>
      <>
        <ModalHeader>{t('title')}</ModalHeader>
        <ModalBody>
          {t('description', { invoiceId: invoiceData.invoiceId || '' })}
        </ModalBody>
        {renderModalFooter()}
      </>
    </AppModal>
  );
};

export default DeleteInvoiceModal;
