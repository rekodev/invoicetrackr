'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { ClientModel } from '@/lib/types/models/client';

import ClientCard from '../ui/client-card';
import ClientFormDialog from '../client/client-form-dialog';

type Props = {
  userId: number;
  isOpen: boolean;
  clients: Array<ClientModel>;
  onClose: () => void;
  onReceiverSelect: (client: ClientModel) => void;
};

const InvoiceFormPartyModal = ({
  userId,
  isOpen,
  clients,
  onClose,
  onReceiverSelect
}: Props) => {
  const t = useTranslations('components.invoice_form');
  const [isAddNewClientModalOpen, setIsAddNewClientModalOpen] = useState(false);

  const renderBody = () => {
    if (!clients?.length) {
      return <p className="text-default-500">{t('modals.no_clients')}</p>;
    }

    return clients?.map((client) => (
      <ClientCard
        key={client.id}
        onClick={() => onReceiverSelect(client)}
        client={client}
      />
    ));
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>{t('modals.select_client')}</ModalHeader>
          <ModalBody>{renderBody()}</ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onPress={() => setIsAddNewClientModalOpen(true)}
              startContent={<PlusCircleIcon className="h-5 w-5" />}
            >
              {t('buttons.add_new')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <ClientFormDialog
        userId={userId}
        isOpen={isAddNewClientModalOpen}
        onClose={() => setIsAddNewClientModalOpen(false)}
      />
    </>
  );
};

export default InvoiceFormPartyModal;
