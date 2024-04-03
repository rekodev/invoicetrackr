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
} from '@nextui-org/react';
import { ChangeEvent, useState } from 'react';

import { ClientModel } from '@/types/models/client';
import { InvoicePartyBusinessType } from '@/types/models/invoice';
import { capitalize } from '@/utils';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const clientBusinessTypes: Array<InvoicePartyBusinessType> = [
  'business',
  'individual',
];

type ClientFormData = Record<keyof Omit<ClientModel, 'id' | 'type'>, string>;

const AddNewClientModal = ({ isOpen, onClose }: Props) => {
  const [clientData, setClientData] = useState<ClientFormData>({
    address: '',
    businessNumber: '',
    businessType: '',
    email: '',
    name: '',
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Omit<ClientModel, 'id' | 'type'>
  ) => {
    setClientData((prev) => ({ ...prev, [field]: event.target.value }));
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
            {clientBusinessTypes.map((type) => (
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
          <Button color='secondary' onPress={onClose}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddNewClientModal;
