import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  toast
} from '@heroui/react';
import { AppModal } from '@/components/ui/app-modal';
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
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button variant="outline" onPress={onClose}>
            {t('cancel_button')}
          </Button>
          <Button variant="danger" isPending={isPending} onPress={handleSubmit}>
            {t('confirm_button')}
          </Button>
        </div>
      </div>
    </ModalFooter>
  );

  return (
    <AppModal isOpen={isOpen} onClose={onClose}>
      <>
        <ModalHeader>
          {t('title', { bank_number: bankAccount?.accountNumber })}
        </ModalHeader>
        <ModalBody>{t('description')}</ModalBody>
        {renderModalFooter()}
      </>
    </AppModal>
  );
};

export default DeleteBankAccountDialog;
