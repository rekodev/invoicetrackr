'use client';

import { Modal } from '@heroui/react';
import { useTranslations } from 'next-intl';

import BankAccountForm from './bank-account-form';

type Props = {
  userId: number;
  selectedBankAccountId?: number | null;
  isOpen: boolean;
  onClose: () => void;
};

const AddBankAccountDialog = ({
  userId,
  selectedBankAccountId,
  isOpen,
  onClose
}: Props) => {
  const t = useTranslations('profile.banking_information.form');

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{t('title.create')}</Modal.Heading>
          </Modal.Header>
          <Modal.Body>
            <BankAccountForm
              userId={userId}
              userSelectedBankAccountId={selectedBankAccountId}
              onCancel={onClose}
              onSuccess={onClose}
            />
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default AddBankAccountDialog;
