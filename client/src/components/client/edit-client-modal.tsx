import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem
} from '@heroui/react';
import { ChangeEvent, useState } from 'react';

import { updateClientAction } from '@/lib/actions/client';
import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { UiState } from '@/lib/constants/ui-state';
import { ClientModel } from '@/lib/types/models/client';
import { capitalize } from '@/lib/utils';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  clientData: ClientModel;
};

type ClientFormData = ClientModel;

const EditClientModal = ({ userId, isOpen, onClose, clientData }: Props) => {
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);
  const [newClientData, setNewClientData] =
    useState<ClientFormData>(clientData);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Omit<ClientModel, 'id' | 'type'>
  ) => {
    setNewClientData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    setUiState(UiState.Pending);
    setSubmissionMessage('');

    const response = await updateClientAction({
      userId,
      clientData: newClientData
    });
    setSubmissionMessage(response.message);

    if ('error' in response) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Edit Client</ModalHeader>
        <ModalBody>
          <Input
            value={newClientData.name}
            onChange={(event) => handleChange(event, 'name')}
            type="text"
            label="Name"
            variant="bordered"
            isRequired
          />
          <Select
            value={newClientData.businessType}
            onChange={(event) => handleChange(event, 'businessType')}
            label="Business Type"
            variant="bordered"
            defaultSelectedKeys={[newClientData.businessType]}
            isRequired
          >
            {CLIENT_BUSINESS_TYPES.map((type) => (
              <SelectItem key={type}>{capitalize(type)}</SelectItem>
            ))}
          </Select>
          <Input
            value={newClientData.businessNumber}
            onChange={(event) => handleChange(event, 'businessNumber')}
            type="text"
            label="Business Number"
            variant="bordered"
            isRequired
          />
          <Input
            value={newClientData.address}
            onChange={(event) => handleChange(event, 'address')}
            type="text"
            label="Address"
            variant="bordered"
            isRequired
          />
          <Input
            value={newClientData.email}
            onChange={(event) => handleChange(event, 'email')}
            type="email"
            label="Email"
            variant="bordered"
            isRequired
          />
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col items-start justify-between gap-5 overflow-x-hidden">
            {submissionMessage && (
              <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
                {submissionMessage}
              </Chip>
            )}
            <div className="flex w-full justify-end gap-1">
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                isLoading={uiState === UiState.Pending}
                color="secondary"
                onPress={handleSubmit}
              >
                Save
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditClientModal;
