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
import { useTranslations } from 'next-intl';
import { SubmitHandler, useForm } from 'react-hook-form';

import { addClientAction, updateClientAction } from '@/lib/actions/client';
import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { ClientModel } from '@/lib/types/models/client';

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
  const t = useTranslations('clients.form_dialog');
  const tTypes = useTranslations('clients.form_dialog.business_types');
  
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
      title: response.message || '',
      color: response.ok ? 'success' : 'danger'
    });

    if (!response.ok) return;

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            {!!clientData ? t('title_edit') : t('title_add')}
          </ModalHeader>
          <ModalBody>
            <Input
              {...register('name')}
              type="text"
              label={t('fields.name')}
              variant="bordered"
              isRequired
            />
            <Select
              {...register('businessType')}
              label={t('fields.business_type')}
              variant="bordered"
              defaultSelectedKeys={clientData ? [clientData.businessType] : []}
              isRequired
            >
              {CLIENT_BUSINESS_TYPES.map((type) => (
                <SelectItem key={type}>{tTypes(type)}</SelectItem>
              ))}
            </Select>
            <Input
              {...register('businessNumber')}
              type="text"
              label={t('fields.business_number')}
              variant="bordered"
              isRequired
            />
            <Input
              {...register('address')}
              type="text"
              label={t('fields.address')}
              variant="bordered"
              isRequired
            />
            <Input
              {...register('email')}
              type="email"
              label={t('fields.email')}
              variant="bordered"
            />
          </ModalBody>
          <ModalFooter>
            <div className="flex w-full flex-col items-start justify-between gap-5 overflow-x-hidden">
              <div className="flex w-full justify-end gap-1">
                <Button color="danger" variant="light" onPress={onClose}>
                  {t('cancel')}
                </Button>
                <Button
                  isDisabled={isLoading || !isDirty}
                  isLoading={isLoading}
                  color="secondary"
                  type="submit"
                >
                  {!!clientData ? t('submit_edit') : t('submit_add')}
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
