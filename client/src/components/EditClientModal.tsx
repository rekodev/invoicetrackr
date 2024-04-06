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
  SelectItem,
} from '@nextui-org/react';
import { ChangeEvent, useState } from 'react';

import { updateClient } from '@/api';
import { UiState } from '@/constants/uiState';
import useGetClients from '@/hooks/useGetClients';
import useGetUser from '@/hooks/useGetUser';
import { ClientModel } from '@/types/models/client';
import { InvoicePartyBusinessType } from '@/types/models/invoice';
import { capitalize } from '@/utils';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  clientData: ClientModel;
};

const CLIENT_BUSINESS_TYPES: Array<InvoicePartyBusinessType> = [
  'business',
  'individual',
];

type ClientFormData = ClientModel;

const EditClientModal = ({ isOpen, onClose, clientData }: Props) => {
  const { user } = useGetUser();
  const { mutateClients } = useGetClients();

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
    if (!user?.id) return;

    setUiState(UiState.Pending);
    setSubmissionMessage('');

    const response = await updateClient(user.id, newClientData);
    setSubmissionMessage(response.data.message);

    if ('error' in response.data) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);

    mutateClients();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Edit Client</ModalHeader>
        <ModalBody>
          <Input
            value={newClientData.name}
            onChange={(event) => handleChange(event, 'name')}
            type='text'
            label='Name'
            variant='bordered'
            isRequired
          />
          <Select
            value={newClientData.businessType}
            onChange={(event) => handleChange(event, 'businessType')}
            label='Business Type'
            variant='bordered'
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
            type='text'
            label='Business Number'
            variant='bordered'
            isRequired
          />
          <Input
            value={newClientData.address}
            onChange={(event) => handleChange(event, 'address')}
            type='text'
            label='Address'
            variant='bordered'
            isRequired
          />
          <Input
            value={newClientData.email}
            onChange={(event) => handleChange(event, 'email')}
            type='email'
            label='Email'
            variant='bordered'
            isRequired
          />
        </ModalBody>
        <ModalFooter>
          <div className='flex w-full items-center justify-between'>
            {submissionMessage && (
              <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
                {submissionMessage}
              </Chip>
            )}
            <div className='flex gap-1 justify-end w-full'>
              <Button color='danger' variant='light' onPress={onClose}>
                Cancel
              </Button>
              <Button
                isLoading={uiState === UiState.Pending}
                color='secondary'
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
