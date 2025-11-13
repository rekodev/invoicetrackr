'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast
} from '@heroui/react';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { ClientBody } from '@invoicetrackr/types';
import { deleteClientAction } from '@/lib/actions/client';

type Props = {
  userId: number;
  clientData: ClientBody;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteClientModal = ({ userId, isOpen, onClose, clientData }: Props) => {
  const t = useTranslations('clients.delete_modal');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () =>
    startTransition(async () => {
      if (!clientData.id) return;

      const response = await deleteClientAction({
        userId,
        clientId: clientData.id
      });

      addToast({
        title: response.message || '',
        color: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) return;

      onClose();
    });

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button color="danger" variant="light" onPress={onClose}>
            {t('cancel')}
          </Button>
          <Button isLoading={isPending} color="danger" onPress={handleSubmit}>
            {t('confirm')}
          </Button>
        </div>
      </div>
    </ModalFooter>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{t('title')}</ModalHeader>
        <ModalBody>
          {t('description', { clientName: clientData.name })}
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default DeleteClientModal;
