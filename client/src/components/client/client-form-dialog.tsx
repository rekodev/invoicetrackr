'use client';

import {
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  Select,
  TextField,
  toast
} from '@heroui/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
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
  vatNumber: '',
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
    control,
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

    toast(response.message || '', {
      variant: response.ok ? 'success' : 'danger'
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
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Header>
                <Modal.Heading>
                  {!!clientData ? t('title_edit') : t('title_add')}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-2">
                <TextField variant="secondary" isInvalid={!!errors.name}>
                  <Label>{t('fields.name')}</Label>
                  <Input {...register('name')} type="text" />
                  <FieldError>{errors.name?.message}</FieldError>
                </TextField>
                <Controller
                  control={control}
                  name="businessType"
                  render={({ field }) => (
                    <Select
                      variant="secondary"
                      value={field.value}
                      onChange={field.onChange}
                      isInvalid={!!errors.businessType}
                    >
                      <Label>{t('fields.business_type')}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {CLIENT_BUSINESS_TYPES.map((type) => (
                            <ListBoxItem
                              key={type}
                              id={type}
                              textValue={tTypes(type)}
                            >
                              {tTypes(type)}
                              <ListBoxItem.Indicator />
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </Select.Popover>
                      <FieldError>{errors.businessType?.message}</FieldError>
                    </Select>
                  )}
                />
                <TextField
                  variant="secondary"
                  isInvalid={!!errors.businessNumber}
                >
                  <Label>{t('fields.business_number')}</Label>
                  <Input {...register('businessNumber')} type="text" />
                  <FieldError>{errors.businessNumber?.message}</FieldError>
                </TextField>
                <TextField variant="secondary" isInvalid={!!errors.vatNumber}>
                  <Label>{t('fields.vat_number')}</Label>
                  <Input {...register('vatNumber')} type="text" />
                  <FieldError>{errors.vatNumber?.message}</FieldError>
                </TextField>
                <TextField variant="secondary" isInvalid={!!errors.address}>
                  <Label>{t('fields.address')}</Label>
                  <Input {...register('address')} type="text" />
                  <FieldError>{errors.address?.message}</FieldError>
                </TextField>
                <TextField variant="secondary" isInvalid={!!errors.email}>
                  <Label>{t('fields.email')}</Label>
                  <Input {...register('email')} type="email" />
                  <FieldError>{errors.email?.message}</FieldError>
                </TextField>
              </Modal.Body>
              <Modal.Footer>
                <div className="flex w-full flex-col items-start justify-between gap-5 overflow-x-hidden">
                  <div className="flex w-full justify-end gap-1">
                    <Button variant="danger-soft" onPress={onClose}>
                      {t('cancel')}
                    </Button>
                    <Button
                      data-testid="client-form-dialog-submit-button"
                      isDisabled={isLoading || !isDirty}
                      type="submit"
                    >
                      {!!clientData ? t('submit_edit') : t('submit_add')}
                    </Button>
                  </div>
                </div>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ClientFormDialog;
