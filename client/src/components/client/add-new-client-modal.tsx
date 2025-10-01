import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem
} from '@heroui/react';
import { ChangeEvent, useState, useTransition } from 'react';

import { addClientAction } from '@/lib/actions/client';
import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { ClientFormData, ClientModel } from '@/lib/types/models/client';
import { capitalize } from '@/lib/utils';
import { mapValidationErrors } from '@/lib/utils/validation';

const INITIAL_CLIENT_DATA: ClientFormData = {
  name: '',
  type: 'receiver',
  businessType: null,
  businessNumber: '',
  address: '',
  email: ''
};

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
};

const AddNewClientModal = ({ userId, isOpen, onClose }: Props) => {
  const [clientData, setClientData] =
    useState<ClientFormData>(INITIAL_CLIENT_DATA);
  const [isPending, startTransition] = useTransition();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Omit<ClientModel, 'id' | 'type'>
  ) => {
    setClientData((prev) => ({ ...prev, [field]: event.target.value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async () =>
    startTransition(async () => {
      const result = await addClientAction({
        userId,
        clientData
      });

      addToast({
        title: result.message,
        color: 'errors' in result ? 'danger' : 'success'
      });

      if ('errors' in result) {
        const validationErrors = mapValidationErrors(
          result.errors as Array<Record<string, string>>
        );

        setValidationErrors(validationErrors);

        return;
      }

      onClose();
    });

  const handleCloseAndClear = () => {
    onClose();
    setValidationErrors({});
    setClientData(INITIAL_CLIENT_DATA);
  };

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full flex-col items-start justify-between gap-5 overflow-x-hidden">
        <div className="flex w-full justify-end gap-1">
          <Button color="danger" variant="light" onPress={handleCloseAndClear}>
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            color="secondary"
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
            type="text"
            label="Name"
            variant="bordered"
            isInvalid={!!validationErrors['name']}
            errorMessage={validationErrors['name']}
          />
          <Select
            value={clientData.businessType || ''}
            onChange={(event) => handleChange(event, 'businessType')}
            label="Business Type"
            variant="bordered"
            isInvalid={!!validationErrors['businessType']}
            errorMessage={validationErrors['businessType']}
          >
            {CLIENT_BUSINESS_TYPES.map((type) => (
              <SelectItem key={type}>{capitalize(type)}</SelectItem>
            ))}
          </Select>
          <Input
            value={clientData.businessNumber}
            onChange={(event) => handleChange(event, 'businessNumber')}
            type="text"
            label="Business Number"
            variant="bordered"
            isInvalid={!!validationErrors['businessNumber']}
            errorMessage={validationErrors['businessNumber']}
          />
          <Input
            value={clientData.address}
            onChange={(event) => handleChange(event, 'address')}
            type="text"
            label="Address"
            variant="bordered"
            isInvalid={!!validationErrors['address']}
            errorMessage={validationErrors['address']}
          />
          <Input
            value={clientData.email}
            onChange={(event) => handleChange(event, 'email')}
            type="email"
            label="Email"
            variant="bordered"
            isInvalid={!!validationErrors['email']}
            errorMessage={validationErrors['email']}
          />
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default AddNewClientModal;
