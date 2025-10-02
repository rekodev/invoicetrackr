import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { useTransition } from 'react';

import { deleteBankingInformationAction } from '@/lib/actions/banking-information';
import { BankingInformationFormModel } from '@/lib/types/models/user';

type Props = {
  userId: number;
  bankingInformation: BankingInformationFormModel;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteBankAccountDialog = ({
  userId,
  isOpen,
  onClose,
  bankingInformation: bankAccount
}: Props) => {
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
        color: 'errors' in response ? 'danger' : 'success'
      });

      if (!response.ok) return;

      onClose();
    });

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button color="danger" onPress={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            color="secondary"
            onPress={handleSubmit}
          >
            Delete
          </Button>
        </div>
      </div>
    </ModalFooter>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          Are you sure you want to delete {bankAccount.accountNumber}?
        </ModalHeader>
        <ModalBody>
          This banking information will be deleted immediately. You can&apos;t
          undo this action.
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default DeleteBankAccountDialog;
