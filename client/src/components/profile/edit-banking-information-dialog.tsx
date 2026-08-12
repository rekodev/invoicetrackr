import {
  Button,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
  toast
} from '@heroui/react';
import { BankAccount } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { updateBankingInformationAction } from '@/lib/actions/banking-information';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  bankingInformation: BankAccount;
};

const EditBankingInformationDialog = ({
  userId,
  isOpen,
  onClose,
  bankingInformation
}: Props) => {
  const t = useTranslations('profile.banking_information.form');
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<BankAccount>({ defaultValues: bankingInformation });

  const onSubmit: SubmitHandler<BankAccount> = async (data) => {
    const response = await updateBankingInformationAction(userId, data);

    toast(response.message, {
      variant: response.ok ? 'success' : 'danger'
    });

    if (!response.ok) {
      Object.entries(response.validationErrors || {}).forEach(
        ([key, message]) => {
          setError(key as keyof BankAccount, { message });
        }
      );
      return;
    }

    onClose();
  };

  const renderTextField = ({
    name,
    label,
    placeholder
  }: {
    name: keyof BankAccount;
    label: string;
    placeholder: string;
  }) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField variant="secondary" isInvalid={Boolean(errors[name])}>
          <Label>{label}</Label>
          <Input
            name={field.name}
            value={String(field.value ?? '')}
            onBlur={field.onBlur}
            onChange={field.onChange}
            type="text"
            placeholder={placeholder}
          />
          {errors[name]?.message ? (
            <FieldError>{errors[name].message}</FieldError>
          ) : null}
        </TextField>
      )}
    />
  );

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t('title.edit')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {renderTextField({
                name: 'name',
                label: t('bank_name'),
                placeholder: t('bank_name_placeholder')
              })}
              {renderTextField({
                name: 'code',
                label: t('bank_code'),
                placeholder: t('bank_code_placeholder')
              })}
              {renderTextField({
                name: 'accountNumber',
                label: t('bank_account_number'),
                placeholder: t('bank_account_number_placeholder')
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
                    {t('actions.cancel')}
                  </Button>
                  <Button
                    isPending={isSubmitting}
                    className="w-full sm:w-auto"
                    onPress={() => void handleSubmit(onSubmit)()}
                  >
                    {t('actions.save')}
                  </Button>
                </div>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default EditBankingInformationDialog;
