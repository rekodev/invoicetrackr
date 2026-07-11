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
import { Controller, useForm } from 'react-hook-form';
import { JSX, useEffect, useMemo, useState, useTransition } from 'react';
import { BlobProvider } from '@react-pdf/renderer';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { regeneratePublicInvoiceLink, sendInvoiceEmail } from '@/api/invoice';
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
  const [publicInvoiceToken, setPublicInvoiceToken] = useState(
    invoice.publicInvoiceToken || ''
  );
  const [publicInvoiceExpiresAt, setPublicInvoiceExpiresAt] = useState(
    invoice.publicInvoiceExpiresAt || ''
  );
  const [publicInvoiceRevokedAt, setPublicInvoiceRevokedAt] = useState(
    invoice.publicInvoiceRevokedAt || ''
  );
  const defaultRecipientEmail =
    invoice.receiver.email || invoice.recipientSigningEmail || '';
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
    control,
    handleSubmit,
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
  const publicLinkExpiresAt = publicInvoiceExpiresAt
    ? new Date(publicInvoiceExpiresAt)
    : null;
  const isPublicLinkExpired = Boolean(
    publicLinkExpiresAt && publicLinkExpiresAt.getTime() <= Date.now()
  );

  const publicLinkStatus = useMemo(() => {
    if (!publicInvoiceToken) return 'missing';
    if (publicInvoiceRevokedAt) return 'revoked';
    if (isPublicLinkExpired) return 'expired';

    return 'active';
  }, [isPublicLinkExpired, publicInvoiceRevokedAt, publicInvoiceToken]);

  const publicInvoiceLink =
    typeof window !== 'undefined' && publicInvoiceToken
      ? `${window.location.origin}/invoices/public/${publicInvoiceToken}`
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
    setPublicInvoiceToken(invoice.publicInvoiceToken || '');
    setPublicInvoiceExpiresAt(invoice.publicInvoiceExpiresAt || '');
    setPublicInvoiceRevokedAt(invoice.publicInvoiceRevokedAt || '');
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
    invoice.publicInvoiceExpiresAt,
    invoice.publicInvoiceRevokedAt,
    invoice.publicInvoiceToken,
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

  const handleGeneratePublicLink = () =>
    startTransition(async () => {
      const response = await regeneratePublicInvoiceLink(
        userId,
        Number(invoice.id)
      );

      toast(response.data.message, {
        variant: isResponseError(response) ? 'danger' : 'success'
      });

      if (!isResponseError(response)) {
        setPublicInvoiceToken(response.data.publicInvoiceToken);
        setPublicInvoiceExpiresAt(response.data.publicInvoiceExpiresAt || '');
        setPublicInvoiceRevokedAt('');
      }
    });

  const handleCopyPublicLink = async () => {
    if (!publicInvoiceLink) return;

    await navigator.clipboard.writeText(publicInvoiceLink);
    toast(t('public_link_copied'), { variant: 'success' });
  };

  const handleIncludePublicLinkChange = (selected: boolean) => {
    setIncludePublicLink(selected);
    if (!selected) setRequestSignature(false);
  };

  const handleRequestSignatureChange = (selected: boolean) => {
    setRequestSignature(selected);
    if (selected) setIncludePublicLink(true);
  };

  const invoiceAmount = invoice.totalAmount
    ? `${getCurrencySymbol(currency)}${invoice.totalAmount}`
    : '-';

  const renderPublicLinkPreview = () => {
    if (!includePublicLink) return null;

    return (
      <div className="bg-segment mx-2 flex items-center gap-2 rounded-3xl border p-2">
        <LinkIcon className="text-muted ml-2 h-4 w-4 shrink-0" />
        {publicLinkStatus === 'active' ? (
          <>
            <code className="text-muted min-w-0 flex-1 truncate text-xs">
              {publicInvoiceLink}
            </code>
            <Button
              size="sm"
              variant="tertiary"
              isDisabled={!publicInvoiceLink}
              onPress={handleCopyPublicLink}
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              {t('copy_public_link')}
            </Button>
          </>
        ) : (
          <>
            <span className="text-muted min-w-0 flex-1 truncate text-xs">
              {t('public_link_generated_on_send')}
            </span>
            {isIssued ? (
              <Button
                size="sm"
                isDisabled={isPending}
                onPress={handleGeneratePublicLink}
              >
                {publicLinkStatus === 'missing'
                  ? t('generate_public_link')
                  : t('regenerate_public_link')}
              </Button>
            ) : null}
          </>
        )}
      </div>
    );
  };

  const renderOptions = () => (
    <Card variant="secondary" className="flex flex-col gap-2 border p-2">
      <Checkbox
        id="include-public-link"
        variant="primary"
        isSelected={includePublicLink}
        onChange={handleIncludePublicLinkChange}
        className="rounded-lg px-2 py-2"
      >
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label htmlFor="include-public-link">
            {t('include_public_link')}
          </Label>
          <p className="text-muted text-xs">{t('public_link_note')}</p>
        </Checkbox.Content>
      </Checkbox>
      {renderPublicLinkPreview()}
      <Checkbox
        id="request-signature"
        variant="primary"
        isSelected={requestSignature}
        onChange={handleRequestSignatureChange}
        className="rounded-lg px-2 py-2"
      >
        <Checkbox.Control>
          <Checkbox.Indicator />
        </Checkbox.Control>
        <Checkbox.Content>
          <Label htmlFor="request-signature">{t('request_signature')}</Label>
          <p className="text-muted text-xs">{t('signing_link_note')}</p>
        </Checkbox.Content>
      </Checkbox>
    </Card>
  );

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseSendDialog();
        }}
      >
        <Modal.Container size="lg" scroll="outside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <BlobProvider document={pdfDocument}>
              {({ blob }) => (
                <form
                  onSubmit={handleSubmit((data) => onSubmit(data, blob))}
                  encType="multipart/form-data"
                >
                  <Modal.Header>
                    <div className="flex min-w-0 flex-col gap-1 pr-8">
                      <Modal.Heading>
                        {invoice.invoiceId || t('invoice')}
                      </Modal.Heading>
                      <p className="text-muted truncate text-sm">
                        {invoice.receiver.name} - {invoiceAmount}
                      </p>
                    </div>
                  </Modal.Header>
                  <Modal.Body className="flex w-full flex-col gap-4">
                    {!isEmailVerified ? (
                      <Alert status="warning">
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Description>
                            {t('email_verification_required')}
                          </Alert.Description>
                        </Alert.Content>
                      </Alert>
                    ) : null}

                    <Controller
                      control={control}
                      name="recipientEmail"
                      render={({ field }) => (
                        <TextField
                          variant="secondary"
                          isInvalid={!!errors.recipientEmail}
                        >
                          <Label>{t('recipient_email')}</Label>
                          <Input
                            name={field.name}
                            value={field.value}
                            placeholder={t('recipient_placeholder')}
                            onBlur={field.onBlur}
                            onChange={field.onChange}
                          />
                          <FieldError>
                            {errors.recipientEmail?.message}
                          </FieldError>
                        </TextField>
                      )}
                    />
                    <Controller
                      control={control}
                      name="subject"
                      render={({ field }) => (
                        <TextField
                          variant="secondary"
                          isInvalid={!!errors.subject}
                        >
                          <Label>{t('subject_label')}</Label>
                          <Input
                            name={field.name}
                            value={field.value}
                            placeholder={t('subject_placeholder')}
                            onBlur={field.onBlur}
                            onChange={field.onChange}
                          />
                          <FieldError>{errors.subject?.message}</FieldError>
                        </TextField>
                      )}
                    />
                    <Controller
                      control={control}
                      name="message"
                      render={({ field }) => (
                        <TextField
                          variant="secondary"
                          isInvalid={!!errors.message}
                        >
                          <Label>{t('message_label')}</Label>
                          <TextArea
                            name={field.name}
                            value={field.value || ''}
                            placeholder={t('message_placeholder')}
                            onBlur={field.onBlur}
                            onChange={field.onChange}
                          />
                          <FieldError>{errors.message?.message}</FieldError>
                        </TextField>
                      )}
                    />

                    {renderOptions()}
                  </Modal.Body>
                  <Modal.Footer className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-muted flex min-w-0 flex-col gap-0.5 text-xs">
                      <span>
                        {t('attached_pdf')} · {invoice.date}
                      </span>
                    </div>
                    <div className="flex w-full flex-col-reverse gap-2 sm:ml-auto sm:w-auto sm:flex-row">
                      <Button
                        onPress={handleCloseSendDialog}
                        variant="ghost"
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
