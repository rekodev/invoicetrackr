import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  useUser,
} from '@nextui-org/react';
import { ChangeEvent, useState } from 'react';

import { postClient } from '@/api';
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientData, setClientData] = useState<ClientFormData>({
    name: '',
    type: CLIENT_TYPE,
    businessType: 'individual',
    businessNumber: '',
    address: '',
    email: '',
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Omit<ClientModel, 'id' | 'type'>
  ) => {
    setClientData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setIsSubmitting(true);
    const result = await postClient(user.id, clientData);
    setIsSubmitting(false);

    if (result.data) {
      console.log(result.data);
      console.log('success');

      return;
    }

    console.log('failure');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Add New Client</ModalHeader>
        <ModalBody>
          <Input
            onChange={(event) => handleChange(event, 'name')}
            type='text'
            label='Name'
            variant='bordered'
          />
          <Select
            onChange={(event) => handleChange(event, 'businessType')}
            label='Business Type'
            variant='bordered'
          >
            {CLIENT_BUSINESS_TYPES.map((type) => (
              <SelectItem key={type}>{capitalize(type)}</SelectItem>
            ))}
          </Select>
          <Input
            onChange={(event) => handleChange(event, 'businessNumber')}
            type='text'
            label='Business Number'
            variant='bordered'
          />
          <Input
            onChange={(event) => handleChange(event, 'address')}
            type='text'
            label='Address'
            variant='bordered'
          />
          <Input
            onChange={(event) => handleChange(event, 'email')}
            type='email'
            label='Email'
            variant='bordered'
          />
        </ModalBody>
        <ModalFooter>
          <Button color='danger' variant='light' onPress={onClose}>
            Cancel
          </Button>
          <Button
            isLoading={isSubmitting}
            color='secondary'
            onClick={handleSubmit}
            onPress={onClose}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddNewClientModal;
