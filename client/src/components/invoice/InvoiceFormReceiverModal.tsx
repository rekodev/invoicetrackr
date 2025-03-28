"use client";

import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from "react";

import useGetClients from "@/lib/hooks/client/useGetClients";
import { ClientModel } from "@/lib/types/models/client";

import AddNewClientModal from "../client/AddNewClientModal";
import ClientCard from "../ui/client-card";

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
  const [isAddNewClientModalOpen, setIsAddNewClientModalOpen] = useState(false);

  const renderBody = () => {
    if (!clients?.length) {
      return (
        <p className="text-default-500">
          You have no clients. Create one to get started.
        </p>
      );
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
          <ModalHeader>Select Client</ModalHeader>
          <ModalBody>{renderBody()}</ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onPress={() => setIsAddNewClientModalOpen(true)}
              startContent={<PlusCircleIcon className="h-5 w-5" />}
            >
              Add New
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AddNewClientModal
        userId={userId}
        isOpen={isAddNewClientModalOpen}
        onClose={() => setIsAddNewClientModalOpen(false)}
      />
    </>
  );
};

export default InvoiceFormPartyModal;
