import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import { useState } from 'react';

import { deleteBankingInformation, updateUserSelectedBankAccount } from '@/api';
import { UiState } from '@/lib/constants/uiState';
import useGetBankAccounts from '@/lib/hooks/banking-information/useGetBankAccounts';
import useGetUser from '@/lib/hooks/user/useGetUser';
import { BankingInformation } from '@/lib/types/models/user';

type Props = {
  bankAccount: BankingInformation;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteBankAccountModal = ({ isOpen, onClose, bankAccount }: Props) => {
  const { mutateBankAccounts } = useGetBankAccounts();
  const { user } = useGetUser();

  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async () => {
    if (!user?.id || !bankAccount?.id) return;

    setUiState(UiState.Pending);

    const response = await deleteBankingInformation(user.id, bankAccount.id);
    setSubmissionMessage(response.data.message);

    console.log(response.data);

    if ('errors' in response.data) {
      setUiState(UiState.Failure);
      alert('w');

      return;
    }

    setUiState(UiState.Success);
    mutateBankAccounts();
    onClose();
  };

  const renderModalFooter = () => (
    <ModalFooter>
      <div className='flex w-full items-center justify-between'>
        {submissionMessage && (
          <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
            {submissionMessage}
          </Chip>
        )}
        <div className='flex gap-1 justify-end w-full'>
          <Button color='danger' onPress={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={uiState === UiState.Pending}
            color='secondary'
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
