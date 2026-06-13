'use client';

import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FieldError,
  Input,
  Label,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextArea,
  TextField,
  toast
} from '@heroui/react';
import {
  InformationCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { JSX, useEffect, useState, useTransition } from 'react';
import { AppModal } from '@/components/ui/app-modal';
import { BlobProvider } from '@react-pdf/renderer';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  regenerateInvoiceSigningLink,
  revokeInvoiceSigningLink,
  sendInvoiceEmail
} from '@/api/invoice';
import { Currency } from '@/lib/types/currency';
import { InvoiceBody } from '@invoicetrackr/types';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  isOpen: boolean;
  pdfDocument: JSX.Element;
  onClose: () => void;
  userId: number;
  invoice: InvoiceBody;
  currency: Currency;
};

type SendInvoiceForm = {
  recipientEmail: string;
  subject: string;
  message?: string;
  includePublicLink: boolean;
  requestSignature: boolean;
};

export default function SendInvoiceEmailModal({
  isOpen,
  onClose,
  pdfDocument,
  userId,
  invoice,
  currency
}: Props) {
  const t = useTranslations('components.send_invoice_email');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [includePublicLink, setIncludePublicLink] = useState(true);
  const [requestSignature, setRequestSignature] = useState(
    Boolean(invoice.recipientSigningRequestedAt && !invoice.recipientSignedAt)
  );

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setError,
    watch,
    formState: { errors }
  } = useForm<SendInvoiceForm>();
  const defaultRecipientEmail =
    invoice.recipientSigningEmail || invoice.receiver.email || '';
  const defaultRequestSignature = Boolean(
    invoice.recipientSigningRequestedAt && !invoice.recipientSignedAt
  );
  // eslint-disable-next-line react-hooks/incompatible-library
  const recipientEmail = watch('recipientEmail', defaultRecipientEmail);
  const shouldRotateSigningLink = Boolean(
    requestSignature &&
      invoice.recipientSigningToken &&
      (invoice.recipientSigningRevokedAt ||
        (invoice.recipientSigningExpiresAt &&
          new Date(invoice.recipientSigningExpiresAt).getTime() <=
            Date.now()) ||
        (invoice.recipientSigningEmail &&
          invoice.recipientSigningEmail.toLowerCase() !==
            recipientEmail.toLowerCase()))
  );

  const handleCloseSendDialog = () => {
    onClose();
    reset();
    setIncludePublicLink(true);
    setRequestSignature(defaultRequestSignature);
  };

  useEffect(() => {
    setIncludePublicLink(true);
    setRequestSignature(defaultRequestSignature);
  }, [defaultRequestSignature, invoice.id]);

  const onSubmit = (data: SendInvoiceForm, blob: Blob | null) =>
    startTransition(async () => {
      const response = await sendInvoiceEmail({
        id: Number(invoice.id),
        userId,
        blob,
        invoiceId: invoice.invoiceId || '',
        recipientEmail: data.recipientEmail,
        subject: data.subject,
        message: data.message,
        includePublicLink,
        requestSignature: includePublicLink && requestSignature
      });

      toast(response.data.message, {
        variant: isResponseError(response) ? 'danger' : 'success'
      });

      if (isResponseError(response)) {
        response.data.errors.forEach((error) => {
          setError(error.key as keyof SendInvoiceForm, {
            message: error.value
          });
        });

        return;
      }

      handleCloseSendDialog();
      router.refresh();
    });

  const handleSigningLinkAction = (action: 'revoke' | 'regenerate') =>
    startTransition(async () => {
      const response =
        action === 'revoke'
          ? await revokeInvoiceSigningLink(userId, Number(invoice.id))
          : await regenerateInvoiceSigningLink({
              userId,
              invoiceId: Number(invoice.id),
              recipientEmail:
                getValues('recipientEmail') || defaultRecipientEmail
            });

      toast(response.data.message, {
        variant: isResponseError(response) ? 'danger' : 'success'
      });

      if (!isResponseError(response)) {
        handleCloseSendDialog();
        router.refresh();
      }
    });

  return (
    <AppModal isOpen={isOpen} onClose={handleCloseSendDialog} size="3xl">
      <>
        {/* @ts-ignore */}
        <BlobProvider document={pdfDocument}>
          {/* @ts-ignore */}
          {({ blob }) => (
            <form
              onSubmit={handleSubmit((data) => onSubmit(data, blob))}
              encType="multipart/form-data"
            >
              <ModalHeader>
                {t('modal_title', { invoiceId: invoice.invoiceId || '' })}
              </ModalHeader>
              <ModalBody className="w-full">
                <div className="border-secondary-200 bg-secondary-50 dark:bg-secondary-900/20 flex gap-3 rounded-lg border p-3">
                  <InformationCircleIcon className="text-secondary-500 mt-0.5 h-5 w-5 shrink-0" />
                  <div className="flex flex-col gap-1 text-sm">
                    <p>{t('public_link_note')}</p>
                    {requestSignature && <p>{t('signing_link_note')}</p>}
                    {requestSignature && invoice.recipientSigningEmail && (
                      <p className="text-default-500">
                        {t('active_signing_recipient', {
                          email: invoice.recipientSigningEmail
                        })}
                      </p>
                    )}
                    {requestSignature && invoice.recipientSigningRevokedAt ? (
                      <p className="text-danger">{t('signing_link_revoked')}</p>
                    ) : requestSignature &&
                      invoice.recipientSigningExpiresAt ? (
                      <p className="text-default-500">
                        {t('signing_link_expires', {
                          date: new Date(
                            invoice.recipientSigningExpiresAt
                          ).toLocaleDateString()
                        })}
                      </p>
                    ) : null}
                    {requestSignature && shouldRotateSigningLink && (
                      <p className="text-warning">
                        {t('replacement_link_note')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="border-default-100 grid gap-2 rounded-lg border p-3">
                  <Checkbox
                    className="text-sm"
                    isSelected={includePublicLink}
                    onChange={setIncludePublicLink}
                  >
                    {t('include_public_link')}
                  </Checkbox>
                  <Checkbox
                    className="text-sm"
                    isDisabled={!includePublicLink}
                    isSelected={includePublicLink && requestSignature}
                    onChange={setRequestSignature}
                  >
                    {t('request_signature')}
                  </Checkbox>
                  {!includePublicLink && requestSignature && (
                    <p className="text-warning text-xs">
                      {t('signature_requires_public_link')}
                    </p>
                  )}
                </div>
                <TextField
                  variant="secondary"
                  isInvalid={!!errors.recipientEmail}
                >
                  <Label>{t('recipient_email')}</Label>
                  <Input
                    defaultValue={defaultRecipientEmail}
                    {...register('recipientEmail')}
                    placeholder={t('recipient_placeholder')}
                  />
                  <FieldError>{errors.recipientEmail?.message}</FieldError>
                </TextField>
                <TextField variant="secondary" isInvalid={!!errors.subject}>
                  <Label>{t('subject_label')}</Label>
                  <Input
                    defaultValue={`Invoice ${invoice.invoiceId} ${invoice.totalAmount ? `- Amount: ${getCurrencySymbol(currency)}${invoice.totalAmount}` : ''}`}
                    {...register('subject')}
                    placeholder={t('subject_placeholder')}
                  />
                  <FieldError>{errors.subject?.message}</FieldError>
                </TextField>
                <TextField variant="secondary" isInvalid={!!errors.message}>
                  <Label>{t('message_label')}</Label>
                  <TextArea
                    {...register('message')}
                    placeholder={t('message_placeholder')}
                  />
                  <FieldError>{errors.message?.message}</FieldError>
                </TextField>
                <Card className="none border-default-100 border-2 shadow">
                  <CardContent className="flex flex-col gap-2">
                    <p>{t('invoice_details')}</p>
                    <p className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-default-500 text">
                        {t('invoice')}:
                      </span>{' '}
                      {invoice.invoiceId}
                    </p>
                    <p className="flex items-center justify-between text-sm">
                      <span className="text-default-500 text">
                        {t('client')}:
                      </span>{' '}
                      {invoice.receiver.name}
                    </p>
                    <p className="flex items-center justify-between text-sm">
                      <span className="text-default-500 text">
                        {t('amount')}:
                      </span>{' '}
                      {getCurrencySymbol(currency)}
                      {invoice.totalAmount}
                    </p>
                    <p className="flex items-center justify-between text-sm">
                      <span className="text-default-500 text">
                        {t('date')}:
                      </span>
                      {invoice.date}
                    </p>
                  </CardContent>
                </Card>
              </ModalBody>
              <ModalFooter className="flex w-full flex-wrap justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {requestSignature &&
                    invoice.recipientSigningToken &&
                    !invoice.recipientSigningRevokedAt && (
                      <Button
                        size="sm"
                        variant="danger-soft"
                        isDisabled={isPending}
                        onPress={() => handleSigningLinkAction('revoke')}
                      >
                        {t('revoke_signing_link')}
                      </Button>
                    )}
                  {requestSignature &&
                    invoice.recipientSigningToken &&
                    !invoice.recipientSignedAt && (
                      <Button
                        size="sm"
                        variant="tertiary"
                        isDisabled={isPending}
                        onPress={() => handleSigningLinkAction('regenerate')}
                      >
                        {t('regenerate_signing_link')}
                      </Button>
                    )}
                </div>
                <div className="ml-auto flex gap-2">
                  <Button onPress={handleCloseSendDialog} variant="tertiary">
                    {t('cancel')}
                  </Button>
                  <Button isPending={isPending} type="submit">
                    <PaperAirplaneIcon className="h-4 w-4" />
                    {shouldRotateSigningLink
                      ? t('replace_link_and_send')
                      : t('send')}
                  </Button>
                </div>
              </ModalFooter>
            </form>
          )}
        </BlobProvider>
      </>
    </AppModal>
  );
}
