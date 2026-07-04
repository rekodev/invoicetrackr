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
import { useEffect } from 'react';
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
  mode?: 'add' | 'edit';
  clientData?: ClientBody;
};

type ClientFormData = ClientBody;

const getInitialClientData = (clientData?: ClientBody): ClientFormData => ({
  ...INITIAL_CLIENT_DATA,
  ...clientData,
  type: 'receiver'
});

const ClientFormDialog = ({
  userId,
  isOpen,
  onClose,
  mode = 'add',
  clientData
}: Props) => {
  const t = useTranslations('clients.form_dialog');
  const tTypes = useTranslations('clients.form_dialog.business_types');
  const isEditMode = mode === 'edit';

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    setError,
    reset
  } = useForm<ClientFormData>({
    defaultValues: getInitialClientData(clientData)
  });

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && !clientData) return;

    reset(getInitialClientData(clientData));
  }, [clientData, isEditMode, isOpen, reset]);

  const onSubmit: SubmitHandler<ClientFormData> = async (data) => {
    const response =
      isEditMode && clientData
        ? await updateClientAction({
            userId,
            clientData: { ...data, type: 'receiver' }
          })
        : await addClientAction({
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

  const renderTextField = ({
    name,
    label,
    type = 'text'
  }: {
    name: keyof ClientFormData;
    label: string;
    type?: string;
  }) => {
    const error = errors[name];

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TextField variant="secondary" isInvalid={Boolean(error)}>
            <Label>{label}</Label>
            <Input
              name={field.name}
              value={String(field.value ?? '')}
              type={type}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
            {error?.message ? <FieldError>{error.message}</FieldError> : null}
          </TextField>
        )}
      />
    );
  };

  if (isEditMode && !clientData) return null;

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
                  {isEditMode ? t('title_edit') : t('title_add')}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="flex flex-col gap-2">
                {renderTextField({ name: 'name', label: t('fields.name') })}
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
                {renderTextField({
                  name: 'businessNumber',
                  label: t('fields.business_number')
                })}
                {renderTextField({
                  name: 'vatNumber',
                  label: t('fields.vat_number')
                })}
                {renderTextField({
                  name: 'address',
                  label: t('fields.address')
                })}
                {renderTextField({
                  name: 'email',
                  label: t('fields.email'),
                  type: 'email'
                })}
              </Modal.Body>
              <Modal.Footer>
                <div className="flex w-full flex-col items-start justify-between gap-5 overflow-x-hidden">
                  <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
                    <Button
                      variant="danger-soft"
                      className="w-full sm:w-auto"
                      onPress={onClose}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      data-testid="client-form-dialog-submit-button"
                      isDisabled={isSubmitting || !isDirty}
                      type="submit"
                      className="w-full sm:w-auto"
                    >
                      {isEditMode ? t('submit_edit') : t('submit_add')}
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
