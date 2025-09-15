import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { User } from 'next-auth';
import { useState } from 'react';

import { deleteBankingInformationAction } from '@/lib/actions/banking-information';
import { UiState } from '@/lib/constants/ui-state';
import { BankingInformationFormModel } from '@/lib/types/models/user';

type Props = {
  user: User;
  bankAccount: BankingInformationFormModel;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteBankAccountModal = ({
  user,
  isOpen,
  onClose,
  bankAccount
}: Props) => {
  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async () => {
    if (!user?.id || !bankAccount?.id) return;

    setUiState(UiState.Pending);

    const response = await deleteBankingInformationAction(
      Number(user.id),
      bankAccount.id
    );

    if (response.message) setSubmissionMessage(response.message);

    if (!response.ok) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
    onClose();
  };

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        {submissionMessage && (
          <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
            {submissionMessage}
          </Chip>
        )}
        <div className="flex w-full justify-end gap-1">
          <Button color="danger" onPress={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={uiState === UiState.Pending}
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

export default DeleteBankAccountModal;
