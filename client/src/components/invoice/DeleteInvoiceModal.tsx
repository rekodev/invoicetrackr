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

import { deleteInvoice } from '@/api';
import { UiState } from '@/lib/constants/uiState';
import useGetInvoices from '@/lib/hooks/invoice/useGetInvoices';
import useGetUser from '@/lib/hooks/user/useGetUser';
import { InvoiceModel } from '@/lib/types/models/invoice';

type Props = {
  userId: number;
  invoiceData: InvoiceModel;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteInvoiceModal = ({
  userId,
  isOpen,
  onClose,
  invoiceData,
}: Props) => {
  const { mutateInvoices } = useGetInvoices({ userId });
  const { user } = useGetUser({ userId });

  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async () => {
    if (!user?.id || !invoiceData) return;

    setUiState(UiState.Pending);

    const response = await deleteInvoice(user.id, invoiceData.id);
    setSubmissionMessage(response.data.message);

    if ('error' in response.data) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
    onClose();
    mutateInvoices();
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
          Are you sure you want to delete {invoiceData.invoiceId}?
        </ModalHeader>
        <ModalBody>
          This invoice will be deleted immediately. You can&apos;t undo this
          action.
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default DeleteInvoiceModal;
