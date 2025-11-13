import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { deleteBankingInformationAction } from '@/lib/actions/banking-information';
import { BankAccount } from '@invoicetrackr/types';

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

      addToast({
        title: response.message,
        color: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) return;

      onClose();
    });

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button variant="bordered" onPress={onClose}>
            {t('cancel_button')}
          </Button>
          <Button isLoading={isPending} color="danger" onPress={handleSubmit}>
            {t('confirm_button')}
          </Button>
        </div>
      </div>
    </ModalFooter>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          {t('title', { bank_number: bankAccount?.accountNumber })}
        </ModalHeader>
        <ModalBody>{t('description')}</ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default DeleteBankAccountDialog;
