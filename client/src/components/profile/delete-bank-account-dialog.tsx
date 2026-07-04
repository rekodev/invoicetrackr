import {
  Button,
  Modal,
  toast
} from '@heroui/react';
import { BankAccount } from '@invoicetrackr/types';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { deleteBankingInformationAction } from '@/lib/actions/banking-information';

type Props = {
  userId: number;
  bankingInformation: BankAccount;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteBankAccountDialog = ({
  userId,
  isOpen,
  onClose,
  bankingInformation: bankAccount
}: Props) => {
  const t = useTranslations('profile.banking_information.delete_dialog');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () =>
    startTransition(async () => {
      if (!bankAccount?.id) return;

      const response = await deleteBankingInformationAction(
        userId,
        bankAccount.id
      );

      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) return;

      onClose();
    });

  const renderModalFooter = () => (
    <Modal.Footer>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onPress={onClose}
          >
            {t('cancel_button')}
          </Button>
          <Button
            variant="danger"
            isPending={isPending}
            className="w-full sm:w-auto"
            onPress={handleSubmit}
          >
            {t('confirm_button')}
          </Button>
        </div>
      </div>
    </Modal.Footer>
  );

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
        <Modal.Header>
          <Modal.Heading>
          {t('title', { bank_number: bankAccount?.accountNumber })}
          </Modal.Heading>
        </Modal.Header>
        <Modal.Body>{t('description')}</Modal.Body>
        {renderModalFooter()}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default DeleteBankAccountDialog;
