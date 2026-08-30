'use client';

import {
  Alert,
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
import type { ClientBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { addClientAction, updateClientAction } from '@/lib/actions/client';
import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';

const INITIAL_CLIENT_DATA: ClientFormData = {
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

type ClientFormData = Omit<ClientBody, 'archivedAt'>;

const getInitialClientData = (clientData?: ClientBody): ClientFormData => ({
  id: clientData?.id,
  name: clientData?.name || INITIAL_CLIENT_DATA.name,
  type: 'receiver',
  businessType: clientData?.businessType || INITIAL_CLIENT_DATA.businessType,
  businessNumber:
    clientData?.businessNumber || INITIAL_CLIENT_DATA.businessNumber,
  vatNumber: clientData?.vatNumber || INITIAL_CLIENT_DATA.vatNumber,
  address: clientData?.address || INITIAL_CLIENT_DATA.address,
  email: clientData?.email || INITIAL_CLIENT_DATA.email
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
  const [duplicateWarning, setDuplicateWarning] = useState<string>();

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

  const handleClose = () => {
    setDuplicateWarning(undefined);
    onClose();
  };

  const onSubmit: SubmitHandler<ClientFormData> = async (data) => {
    const duplicateConfirmation = duplicateWarning
      ? { duplicateAcknowledged: true }
      : {};
    const response =
      isEditMode && clientData
        ? await updateClientAction({
            userId,
            clientData: { ...data, type: 'receiver' },
            ...duplicateConfirmation
          })
        : await addClientAction({
            userId,
            clientData: { ...data, type: 'receiver' },
            ...duplicateConfirmation
          });

    if (response.code === 'CONFLICT') {
      setDuplicateWarning(response.message);
      return;
    }

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

    handleClose();
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
              onChange={(event) => {
                field.onChange(event);
                setDuplicateWarning(undefined);
              }}
            />
            {error?.message ? <FieldError>{error.message}</FieldError> : null}
          </TextField>
        )}
      />
    );
  };

  if (isEditMode && !clientData) return null;

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
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
                    onChange={(value) => {
                      field.onChange(value);
                      setDuplicateWarning(undefined);
                    }}
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
              <div className="flex w-full flex-col gap-3 overflow-x-hidden">
                {duplicateWarning ? (
                  <Alert status="warning" className="w-full p-0">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>{t('duplicate_warning_title')}</Alert.Title>
                      <Alert.Description>{duplicateWarning}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                ) : null}
                <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
                  <Button
                    variant="ghost"
                    className="w-full sm:w-auto"
                    onPress={handleClose}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    data-testid="client-form-dialog-submit-button"
                    isDisabled={isSubmitting || !isDirty}
                    type="submit"
                    className="w-full sm:w-auto"
                  >
                    {duplicateWarning
                      ? t('submit_duplicate')
                      : isEditMode
                        ? t('submit_edit')
                        : t('submit_add')}
                  </Button>
                </div>
              </div>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default ClientFormDialog;
