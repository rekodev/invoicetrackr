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
import {
  ClipboardDocumentIcon,
  LinkIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { JSX, useEffect, useMemo, useState, useTransition } from 'react';
import { BlobProvider } from '@react-pdf/renderer';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  regenerateInvoiceSigningLink,
  regeneratePublicInvoiceLink,
  revokeInvoiceSigningLink,
  revokePublicInvoiceLink,
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
  const isIssued = (invoice.lifecycleStatus || 'draft') === 'issued';

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
  const publicLinkExpiresAt = invoice.publicInvoiceExpiresAt
    ? new Date(invoice.publicInvoiceExpiresAt)
    : null;
  const isPublicLinkExpired = Boolean(
    publicLinkExpiresAt && publicLinkExpiresAt.getTime() <= Date.now()
  );

  const publicLinkStatus = useMemo(() => {
    if (!invoice.publicInvoiceToken) return 'missing';
    if (invoice.publicInvoiceRevokedAt) return 'revoked';
    if (isPublicLinkExpired) return 'expired';

    return 'active';
  }, [invoice, isPublicLinkExpired]);

  const publicInvoiceLink =
    typeof window !== 'undefined' && invoice.publicInvoiceToken
      ? `${window.location.origin}/invoices/public/${invoice.publicInvoiceToken}`
      : '';

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

  const handlePublicLinkAction = (action: 'revoke' | 'regenerate') =>
    startTransition(async () => {
      const response =
        action === 'revoke'
          ? await revokePublicInvoiceLink(userId, Number(invoice.id))
          : await regeneratePublicInvoiceLink(userId, Number(invoice.id));

      toast(response.data.message, {
        variant: isResponseError(response) ? 'danger' : 'success'
      });

      if (!isResponseError(response)) {
        handleCloseSendDialog();
        router.refresh();
      }
    });

  const handleCopyPublicLink = async () => {
    if (!publicInvoiceLink) return;

    await navigator.clipboard.writeText(publicInvoiceLink);
    toast(t('public_link_copied'), { variant: 'success' });
  };

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
                              <span className="text-muted">
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
                            <span className="text-muted">
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
                    {isIssued && (
                      <Card className="border">
                        <Card.Header className="pb-0">
                          <Card.Title className="flex items-center gap-2">
                            <LinkIcon className="h-4 w-4" />
                            {t('public_link_management')}
                          </Card.Title>
                        </Card.Header>
                        <Card.Content className="flex flex-col gap-3 pt-3">
                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted">
                                {t('public_link_status_label')}
                              </span>
                              <span
                                className={
                                  publicLinkStatus === 'active'
                                    ? 'text-success font-medium'
                                    : publicLinkStatus === 'missing'
                                      ? 'text-muted font-medium'
                                      : 'text-danger font-medium'
                                }
                              >
                                {t(`public_link_status.${publicLinkStatus}`)}
                              </span>
                            </div>
                            {publicLinkExpiresAt &&
                              publicLinkStatus !== 'revoked' && (
                                <p className="text-muted">
                                  {t('public_link_expires', {
                                    date: publicLinkExpiresAt.toLocaleDateString()
                                  })}
                                </p>
                              )}
                            {publicLinkStatus === 'revoked' && (
                              <p className="text-danger">
                                {t('public_link_revoked_note')}
                              </p>
                            )}
                            {publicLinkStatus === 'expired' && (
                              <p className="text-warning">
                                {t('public_link_expired_note')}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                            {publicLinkStatus === 'active' && (
                              <Button
                                size="sm"
                                variant="secondary"
                                isDisabled={isPending}
                                className="w-full sm:w-auto"
                                onPress={handleCopyPublicLink}
                              >
                                <ClipboardDocumentIcon className="h-4 w-4" />
                                {t('copy_public_link')}
                              </Button>
                            )}
                            {invoice.publicInvoiceToken &&
                              publicLinkStatus === 'active' && (
                                <Button
                                  size="sm"
                                  variant="danger-soft"
                                  isDisabled={isPending}
                                  className="w-full sm:w-auto"
                                  onPress={() =>
                                    handlePublicLinkAction('revoke')
                                  }
                                >
                                  {t('revoke_public_link')}
                                </Button>
                              )}
                            <Button
                              size="sm"
                              variant="tertiary"
                              isDisabled={isPending}
                              className="w-full sm:w-auto"
                              onPress={() =>
                                handlePublicLinkAction('regenerate')
                              }
                            >
                              {publicLinkStatus === 'missing'
                                ? t('generate_public_link')
                                : t('regenerate_public_link')}
                            </Button>
                          </div>
                        </Card.Content>
                      </Card>
                    )}
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
                          <span className="text-muted text">
                            {t('invoice')}:
                          </span>{' '}
                          {invoice.invoiceId}
                        </p>
                        <p className="flex items-center justify-between text-sm">
                          <span className="text-muted text">
                            {t('client')}:
                          </span>{' '}
                          {invoice.receiver.name}
                        </p>
                        <p className="flex items-center justify-between text-sm">
                          <span className="text-muted text">
                            {t('amount')}:
                          </span>{' '}
                          {getCurrencySymbol(currency)}
                          {invoice.totalAmount}
                        </p>
                        <p className="flex items-center justify-between text-sm">
                          <span className="text-muted text">{t('date')}:</span>
                          {invoice.date}
                        </p>
                      </Card.Content>
                    </Card>
                  </Modal.Body>
                  <Modal.Footer className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-between">
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
                      {requestSignature &&
                        invoice.recipientSigningToken &&
                        !invoice.recipientSigningRevokedAt && (
                          <Button
                            size="sm"
                            variant="danger-soft"
                            isDisabled={isPending}
                            className="w-full sm:w-auto"
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
                            className="w-full sm:w-auto"
                            onPress={() =>
                              handleSigningLinkAction('regenerate')
                            }
                          >
                            {t('regenerate_signing_link')}
                          </Button>
                        )}
                    </div>
                    <div className="flex w-full flex-col-reverse gap-2 sm:ml-auto sm:w-auto sm:flex-row">
                      <Button
                        onPress={handleCloseSendDialog}
                        variant="tertiary"
                        className="w-full sm:w-auto"
                      >
                        {t('cancel')}
                      </Button>
                      <Button
                        isDisabled={!isEmailVerified}
                        isPending={isPending}
                        type="submit"
                        className="w-full sm:w-auto"
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
