'use client';

import {
  ArrowDownTrayIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import {
  Alert,
  Button,
  buttonVariants,
  FieldError,
  Input,
  Label,
  Modal,
  TextField,
  toast
} from '@heroui/react';
import type { DeleteUserAccountBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { logOutAction } from '@/lib/actions';
import { deleteUserAccountAction } from '@/lib/actions/user';
import {
  accountDataExportHref,
  matchesAccountEmail
} from '@/lib/utils/account-data';

type Props = {
  userId: number;
  email: string;
  isOpen: boolean;
  onClose: () => void;
};

const REMOVED_ITEMS = ['account', 'records', 'files', 'sessions'] as const;
const KEPT_ITEMS = ['audit', 'backups'] as const;

const DeleteAccountModal = ({ userId, email, isOpen, onClose }: Props) => {
  const t = useTranslations('profile.account_settings.delete_account.dialog');
  const {
    control,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<DeleteUserAccountBody>({ defaultValues: { confirmEmail: '' } });

  useEffect(() => {
    if (isOpen) reset({ confirmEmail: '' });
  }, [isOpen, reset]);

  const isConfirmed = matchesAccountEmail(watch('confirmEmail'), email);

  const onSubmit: SubmitHandler<DeleteUserAccountBody> = async ({
    confirmEmail
  }) => {
    const response = await deleteUserAccountAction({ userId, confirmEmail });

    toast(response.message, { variant: response.ok ? 'success' : 'danger' });

    if (!response.ok) {
      setError('confirmEmail', {
        message: response.validationErrors?.confirmEmail ?? response.message
      });
      return;
    }

    onClose();
    await logOutAction();
  };

  const renderList = (
    title: string,
    items: readonly string[],
    prefix: string
  ) => (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium">{title}</p>
      <ul className="text-muted list-disc pl-5 text-sm">
        {items.map((item) => (
          <li key={item}>{t(`${prefix}.${item}`)}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Modal.Header className="flex-row items-center gap-2">
              <ExclamationTriangleIcon className="text-danger h-6 w-6" />
              <Modal.Heading>{t('title')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <p className="text-sm">{t('description')}</p>
              {renderList(t('removed.title'), REMOVED_ITEMS, 'removed')}
              {renderList(t('kept.title'), KEPT_ITEMS, 'kept')}
              <Alert status="warning">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{t('records_duty.title')}</Alert.Title>
                  <Alert.Description>
                    {t('records_duty.description')}
                  </Alert.Description>
                  <a
                    href={accountDataExportHref}
                    className={buttonVariants({
                      size: 'sm',
                      variant: 'secondary',
                      className: 'mt-2 w-fit'
                    })}
                  >
                    <ArrowDownTrayIcon className="size-4" />
                    {t('records_duty.export')}
                  </a>
                </Alert.Content>
              </Alert>
              <Controller
                control={control}
                name="confirmEmail"
                render={({ field }) => (
                  <TextField
                    variant="secondary"
                    isInvalid={Boolean(errors.confirmEmail)}
                  >
                    <Label>{t('confirm_email.label', { email })}</Label>
                    <Input
                      type="email"
                      autoComplete="off"
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                    {errors.confirmEmail?.message ? (
                      <FieldError>{errors.confirmEmail.message}</FieldError>
                    ) : null}
                  </TextField>
                )}
              />
            </Modal.Body>
            <Modal.Footer className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
              <Button
                className="w-full sm:w-auto"
                variant="ghost"
                onPress={onClose}
              >
                {t('cancel_button')}
              </Button>
              <Button
                type="submit"
                variant="danger"
                isDisabled={!isConfirmed}
                isPending={isSubmitting}
                className="w-full sm:w-auto"
              >
                {t('confirm_button')}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default DeleteAccountModal;
