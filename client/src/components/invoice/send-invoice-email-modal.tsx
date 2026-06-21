'use client';

import {
  Alert,
  Button,
  Card,
  Checkbox,
  FieldError,
  Input,
  Label,
  Modal,
  TextArea,
  TextField,
  toast
} from '@heroui/react';
import { JSX, useEffect, useState, useTransition } from 'react';
import { BlobProvider } from '@react-pdf/renderer';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
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
  isEmailVerified: boolean;
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
  currency,
  isEmailVerified
}: Props) {
  const t = useTranslations('components.send_invoice_email');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [includePublicLink, setIncludePublicLink] = useState(true);
  const [requestSignature, setRequestSignature] = useState(
    Boolean(invoice.recipientSigningRequestedAt && !invoice.recipientSignedAt)
  );
  const defaultRecipientEmail =
    invoice.recipientSigningEmail || invoice.receiver.email || '';
  const defaultSubject = `Invoice ${invoice.invoiceId} ${
    invoice.totalAmount
      ? `- Amount: ${getCurrencySymbol(currency)}${invoice.totalAmount}`
      : ''
  }`;
  const defaultRequestSignature = Boolean(
    invoice.recipientSigningRequestedAt && !invoice.recipientSignedAt
  );

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setError,
    watch,
    formState: { errors }
  } = useForm<SendInvoiceForm>({
    defaultValues: {
      recipientEmail: defaultRecipientEmail,
      subject: defaultSubject,
      message: '',
      includePublicLink: true,
      requestSignature: defaultRequestSignature
    }
  });
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
    reset({
      recipientEmail: defaultRecipientEmail,
      subject: defaultSubject,
      message: '',
      includePublicLink: true,
      requestSignature: defaultRequestSignature
    });
  }, [
    defaultRecipientEmail,
    defaultRequestSignature,
    defaultSubject,
    invoice.id,
    reset
  ]);

  const onSubmit = (data: SendInvoiceForm, blob: Blob | null) =>
    startTransition(async () => {
      if (!isEmailVerified) return;

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
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseSendDialog();
        }}
      >
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <BlobProvider document={pdfDocument}>
              {({ blob }) => (
                <form
                  onSubmit={handleSubmit((data) => onSubmit(data, blob))}
                  encType="multipart/form-data"
                >
                  <Modal.Header>
                    <Modal.Heading>
                      {t('modal_title', { invoiceId: invoice.invoiceId || '' })}
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body className="flex w-full flex-col gap-3">
                    {!isEmailVerified ? (
                      <Alert className="border" status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Description>
                            {t('email_verification_required')}
                          </Alert.Description>
                        </Alert.Content>
                      </Alert>
                    ) : null}
                    <Alert
                      className="border"
                      status={shouldRotateSigningLink ? 'warning' : 'default'}
                    >
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Description className="flex flex-col gap-1">
                          <span>{t('public_link_note')}</span>
                          {requestSignature && (
                            <span>{t('signing_link_note')}</span>
                          )}
                          {requestSignature &&
                            invoice.recipientSigningEmail && (
                              <span className="text-default-500">
                                {t('active_signing_recipient', {
                                  email: invoice.recipientSigningEmail
                                })}
                              </span>
                            )}
                          {requestSignature &&
                          invoice.recipientSigningRevokedAt ? (
                            <span className="text-danger">
                              {t('signing_link_revoked')}
                            </span>
                          ) : requestSignature &&
                            invoice.recipientSigningExpiresAt ? (
                            <span className="text-default-500">
                              {t('signing_link_expires', {
                                date: new Date(
                                  invoice.recipientSigningExpiresAt
                                ).toLocaleDateString()
                              })}
                            </span>
                          ) : null}
                          {requestSignature && shouldRotateSigningLink && (
                            <span className="text-warning">
                              {t('replacement_link_note')}
                            </span>
                          )}
                        </Alert.Description>
                      </Alert.Content>
                    </Alert>
                    <Checkbox
                      id="include-public-link"
                      variant="secondary"
                      isSelected={includePublicLink}
                      onChange={setIncludePublicLink}
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Content>
                        <Label htmlFor="include-public-link">
                          {t('include_public_link')}
                        </Label>
                      </Checkbox.Content>
                    </Checkbox>
                    <Checkbox
                      id="request-signature"
                      variant="secondary"
                      isDisabled={!includePublicLink}
                      isSelected={includePublicLink && requestSignature}
                      onChange={setRequestSignature}
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Checkbox.Content>
                        <Label htmlFor="request-signature">
                          {t('request_signature')}
                        </Label>
                      </Checkbox.Content>
                    </Checkbox>
                    {!includePublicLink && requestSignature && (
                      <p className="text-warning text-xs">
                        {t('signature_requires_public_link')}
                      </p>
                    )}
                    <TextField
                      variant="secondary"
                      isInvalid={!!errors.recipientEmail}
                    >
                      <Label>{t('recipient_email')}</Label>
                      <Input
                        {...register('recipientEmail')}
                        placeholder={t('recipient_placeholder')}
                      />
                      <FieldError>{errors.recipientEmail?.message}</FieldError>
                    </TextField>
                    <TextField variant="secondary" isInvalid={!!errors.subject}>
                      <Label>{t('subject_label')}</Label>
                      <Input
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
                    <Card className="border">
                      <Card.Header className="pb-0">
                        <Card.Title>{t('invoice_details')}</Card.Title>
                      </Card.Header>
                      <Card.Content className="flex flex-col gap-2">
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
                      </Card.Content>
                    </Card>
                  </Modal.Body>
                  <Modal.Footer className="flex w-full flex-wrap justify-between gap-2">
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
                            onPress={() =>
                              handleSigningLinkAction('regenerate')
                            }
                          >
                            {t('regenerate_signing_link')}
                          </Button>
                        )}
                    </div>
                    <div className="ml-auto flex gap-2">
                      <Button
                        onPress={handleCloseSendDialog}
                        variant="tertiary"
                      >
                        {t('cancel')}
                      </Button>
                      <Button
                        isDisabled={!isEmailVerified}
                        isPending={isPending}
                        type="submit"
                      >
                        <PaperAirplaneIcon className="h-4 w-4" />
                        {shouldRotateSigningLink
                          ? t('replace_link_and_send')
                          : t('send')}
                      </Button>
                    </div>
                  </Modal.Footer>
                </form>
              )}
            </BlobProvider>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
