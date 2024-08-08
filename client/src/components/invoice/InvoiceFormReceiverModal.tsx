import {
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';

import useGetClients from '@/lib/hooks/client/useGetClients';
import { ClientModel } from '@/lib/types/models/client';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onReceiverSelect: (client: ClientModel) => void;
};

const InvoiceFormPartyModal = ({
  userId,
  isOpen,
  onClose,
  onReceiverSelect,
}: Props) => {
  const { clients } = useGetClients({ userId });

  const renderClientOption = (client: ClientModel) => (
    <div key={client.id} onClick={() => onReceiverSelect(client)}>
      <Card isHoverable className='cursor-pointer'>
        <CardHeader className='pb-0.5 uppercase font-bold'>
          {client.name}
        </CardHeader>
        <CardBody className='pt-0'>
          <div className='flex gap-2 text-small text-default-500'>
            <span>{client.address}</span>
            <span>{client.email}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Select Client</ModalHeader>
        <ModalBody>{clients?.map(renderClientOption)}</ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InvoiceFormPartyModal;
