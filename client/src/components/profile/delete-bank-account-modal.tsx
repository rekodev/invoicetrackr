import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { useState } from 'react';

import { deleteBankingInformation } from '@/api';
import { UiState } from '@/lib/constants/ui-state';
import useGetBankAccounts from '@/lib/hooks/banking-information/use-get-bank-accounts';
import useGetUser from '@/lib/hooks/user/use-get-user';
import { BankingInformationFormModel } from '@/lib/types/models/user';

type Props = {
  userId: number;
  bankAccount: BankingInformationFormModel;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteBankAccountModal = ({
  userId,
  isOpen,
  onClose,
  bankAccount
}: Props) => {
  const { mutateBankAccounts } = useGetBankAccounts({ userId });
  const { user } = useGetUser({ userId });

  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async () => {
    if (!user?.id || !bankAccount?.id) return;

    setUiState(UiState.Pending);

    const response = await deleteBankingInformation(user.id, bankAccount.id);
    setSubmissionMessage(response.data.message);

    if ('errors' in response.data) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
    mutateBankAccounts();
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
