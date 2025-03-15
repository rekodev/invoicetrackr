import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from 'react';

import { deleteClient } from '@/api';
import { UiState } from '@/lib/constants/uiState';
import useGetClients from '@/lib/hooks/client/useGetClients';
import useGetUser from '@/lib/hooks/user/useGetUser';
import { ClientModel } from '@/lib/types/models/client';

type Props = {
  userId: number;
  clientData: ClientModel;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteClientModal = ({ userId, isOpen, onClose, clientData }: Props) => {
  const { mutateClients } = useGetClients({ userId });
  const { user } = useGetUser({ userId });

  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async () => {
    if (!user?.id || !clientData?.id) return;

    setUiState(UiState.Pending);

    const response = await deleteClient(user.id, clientData.id);
    setSubmissionMessage(response.data.message);

    if ('error' in response.data) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
    onClose();
    mutateClients();
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
          Are you sure you want to delete {clientData.name}?
        </ModalHeader>
        <ModalBody>
          This client will be deleted immediately. You can&apos;t undo this
          action.
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default DeleteClientModal;
