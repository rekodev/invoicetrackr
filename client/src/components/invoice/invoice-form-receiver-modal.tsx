'use client';

import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { Button, Modal } from '@heroui/react';
import { ClientBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import ClientFormDialog from '../client/client-form-dialog';
import ClientCard from '../client-card';

type Props = {
  userId: number;
  isOpen: boolean;
  clients: Array<ClientBody>;
  onClose: () => void;
  onReceiverSelect: (_client: ClientBody) => void;
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
      return <p className="text-muted">{t('modals.no_clients')}</p>;
    }

    return (
      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
        {clients?.map((client) => (
          <ClientCard
            key={client.id}
            fullDetails
            onClick={() => onReceiverSelect(client)}
            client={client}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Modal>
        <Modal.Backdrop
          isOpen={isOpen}
          onOpenChange={(open) => !open && onClose()}
        >
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>{t('modals.select_client')}</Modal.Heading>
              </Modal.Header>
              <Modal.Body>{renderBody()}</Modal.Body>
              <Modal.Footer>
                <Button
                  className="w-full sm:w-auto"
                  onPress={() => setIsAddNewClientModalOpen(true)}
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  {t('buttons.add_new')}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
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
