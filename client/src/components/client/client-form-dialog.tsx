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
  addToast
} from '@heroui/react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { addClientAction, updateClientAction } from '@/lib/actions/client';
import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { ClientModel } from '@/lib/types/models/client';
import { capitalize } from '@/lib/utils';

const INITIAL_CLIENT_DATA: ClientFormData = {
  name: '',
  type: 'receiver',
  businessType: 'business',
  businessNumber: '',
  address: '',
  email: ''
};

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  clientData?: ClientModel;
};

type ClientFormData = ClientModel;

const ClientFormDialog = ({ userId, isOpen, onClose, clientData }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { isDirty, isLoading }
  } = useForm<ClientFormData>({
    defaultValues: clientData || INITIAL_CLIENT_DATA
  });

  const onSubmit: SubmitHandler<ClientFormData> = async (data) => {
    const response = !clientData
      ? await addClientAction({
          userId,
          clientData: { ...data, type: 'receiver' }
        })
      : await updateClientAction({
          userId,
          clientData: { ...data, type: 'receiver' }
        });

    addToast({
      title: response.message,
      color: 'errors' in response ? 'danger' : 'success'
    });

    if ('errors' in response) return;

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            {!!clientData ? 'Edit Client' : 'Add New Client'}
          </ModalHeader>
          <ModalBody>
            <Input
              {...register('name')}
              type="text"
              label="Name"
              variant="bordered"
              isRequired
            />
            <Select
              {...register('businessType')}
              label="Business Type"
              variant="bordered"
              defaultSelectedKeys={clientData ? [clientData.businessType] : []}
              isRequired
            >
              {CLIENT_BUSINESS_TYPES.map((type) => (
                <SelectItem key={type}>{capitalize(type)}</SelectItem>
              ))}
            </Select>
            <Input
              {...register('businessNumber')}
              type="text"
              label="Business Number"
              variant="bordered"
              isRequired
            />
            <Input
              {...register('address')}
              type="text"
              label="Address"
              variant="bordered"
              isRequired
            />
            <Input
              {...register('email')}
              type="email"
              label="Email"
              variant="bordered"
            />
          </ModalBody>
          <ModalFooter>
            <div className="flex w-full flex-col items-start justify-between gap-5 overflow-x-hidden">
              <div className="flex w-full justify-end gap-1">
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  isDisabled={isLoading || !isDirty}
                  isLoading={isLoading}
                  color="secondary"
                  type="submit"
                >
                  Save
                </Button>
              </div>
            </div>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ClientFormDialog;
