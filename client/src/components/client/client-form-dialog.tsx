'use client';

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
import { useTranslations } from 'next-intl';

import { addClientAction, updateClientAction } from '@/lib/actions/client';
import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { ClientBody } from '@invoicetrackr/types';

const INITIAL_CLIENT_DATA: ClientFormData = {
  id: 0,
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
  clientData?: ClientBody;
};

type ClientFormData = ClientBody;

const ClientFormDialog = ({ userId, isOpen, onClose, clientData }: Props) => {
  const t = useTranslations('clients.form_dialog');
  const tTypes = useTranslations('clients.form_dialog.business_types');

  const {
    register,
    handleSubmit,
    formState: { isDirty, isLoading, errors },
    setError
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

    if (!response.ok) {
      if (response.validationErrors) {
        Object.entries(response?.validationErrors)?.forEach(
          ([key, message]) => {
            setError(key as keyof ClientFormData, {
              message
            });
          }
        );
      }

      return;
    }

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
              isInvalid={!!errors.name}
              errorMessage={errors.name?.message}
            />
            <Select
              {...register('businessType')}
              label={t('fields.business_type')}
              variant="bordered"
              defaultSelectedKeys={clientData ? [clientData.businessType] : []}
              isInvalid={!!errors.businessType}
              errorMessage={errors.businessType?.message}
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
              isInvalid={!!errors.businessNumber}
              errorMessage={errors.businessNumber?.message}
            />
            <Input
              {...register('address')}
              type="text"
              label={t('fields.address')}
              variant="bordered"
              isInvalid={!!errors.address}
              errorMessage={errors.address?.message}
            />
            <Input
              {...register('email')}
              type="email"
              label={t('fields.email')}
              variant="bordered"
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
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
