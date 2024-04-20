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

import { addClient } from '@/api';
import { CLIENT_BUSINESS_TYPES } from '@/constants/client';
import { UiState } from '@/constants/uiState';
import useGetClients from '@/hooks/client/useGetClients';
import useGetUser from '@/hooks/user/useGetUser';
import { ClientFormData, ClientModel } from '@/types/models/client';
import { capitalize } from '@/utils';

const INITIAL_CLIENT_DATA: ClientFormData = {
  name: '',
  type: 'receiver',
  businessType: null,
  businessNumber: '',
  address: '',
  email: '',
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const AddNewClientModal = ({ isOpen, onClose }: Props) => {
  const { user } = useGetUser();
  const { mutateClients } = useGetClients();

  const [clientData, setClientData] =
    useState<ClientFormData>(INITIAL_CLIENT_DATA);
  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Omit<ClientModel, 'id' | 'type'>
  ) => {
    setClientData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setUiState(UiState.Pending);

    const result = await addClient(user.id, clientData);
    setSubmissionMessage(result.data.message);

    if ('error' in result.data) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
    mutateClients();
  };

  const handleCloseAndClear = () => {
    onClose();
    setSubmissionMessage('');
    setClientData(INITIAL_CLIENT_DATA);
  };

  const renderModalFooter = () => (
    <ModalFooter>
      <div className='flex flex-col w-full items-start gap-5 justify-between overflow-x-hidden'>
        {submissionMessage && (
          <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
            {submissionMessage}
          </Chip>
        )}
        <div className='flex gap-1 justify-end w-full'>
          <Button color='danger' variant='light' onPress={handleCloseAndClear}>
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
  );

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndClear}>
      <ModalContent>
        <ModalHeader>Add New Client</ModalHeader>
        <ModalBody>
          <Input
            value={clientData.name}
            onChange={(event) => handleChange(event, 'name')}
            type='text'
            label='Name'
            variant='bordered'
            isRequired
          />
          <Select
            value=''
            onChange={(event) => handleChange(event, 'businessType')}
            label='Business Type'
            variant='bordered'
            isRequired
          >
            {CLIENT_BUSINESS_TYPES.map((type) => (
              <SelectItem key={type}>{capitalize(type)}</SelectItem>
            ))}
          </Select>
          <Input
            value={clientData.businessNumber}
            onChange={(event) => handleChange(event, 'businessNumber')}
            type='text'
            label='Business Number'
            variant='bordered'
            isRequired
          />
          <Input
            value={clientData.address}
            onChange={(event) => handleChange(event, 'address')}
            type='text'
            label='Address'
            variant='bordered'
            isRequired
          />
          <Input
            value={clientData.email}
            onChange={(event) => handleChange(event, 'email')}
            type='email'
            label='Email'
            variant='bordered'
            isRequired
          />
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default AddNewClientModal;
