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
import { UiState } from '@/constants/uiState';
import useGetClients from '@/hooks/useGetClients';
import useGetUser from '@/hooks/useGetUser';
import { ClientModel } from '@/types/models/client';
import {
  InvoicePartyBusinessType,
  InvoicePartyType,
} from '@/types/models/invoice';
import { capitalize } from '@/utils';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const CLIENT_TYPE: InvoicePartyType = 'receiver';
const CLIENT_BUSINESS_TYPES: Array<InvoicePartyBusinessType> = [
  'business',
  'individual',
];

type ClientFormData = Omit<ClientModel, 'id'>;

const AddNewClientModal = ({ isOpen, onClose }: Props) => {
  const { user } = useGetUser();
  const { mutateClients } = useGetClients();

  const [clientData, setClientData] = useState<ClientFormData>({
    name: '',
    type: CLIENT_TYPE,
    businessType: 'individual',
    businessNumber: '',
    address: '',
    email: '',
  });
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

    if ('error' in result) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
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
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Add New Client</ModalHeader>
        <ModalBody>
          <Input
            value={clientData.name}
            onChange={(event) => handleChange(event, 'name')}
            type='text'
            label='Name'
            variant='bordered'
          />
          <Select
            value=''
            onChange={(event) => handleChange(event, 'businessType')}
            label='Business Type'
            variant='bordered'
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
          />
          <Input
            value={clientData.address}
            onChange={(event) => handleChange(event, 'address')}
            type='text'
            label='Address'
            variant='bordered'
          />
          <Input
            value={clientData.email}
            onChange={(event) => handleChange(event, 'email')}
            type='email'
            label='Email'
            variant='bordered'
          />
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default AddNewClientModal;