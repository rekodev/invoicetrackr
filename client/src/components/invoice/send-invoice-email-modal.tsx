'use client';

import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  addToast
} from '@heroui/react';
import { JSX, useTransition } from 'react';
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
};

type SendInvoiceForm = {
  recipientEmail: string;
  subject: string;
  message?: string;
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
  const recipientEmail = watch('recipientEmail', defaultRecipientEmail);
  const shouldRotateSigningLink = Boolean(
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
  };

  const onSubmit = (data: SendInvoiceForm, blob: Blob | null) =>
    startTransition(async () => {
      const response = await sendInvoiceEmail({
        id: Number(invoice.id),
        userId,
        blob,
        invoiceId: invoice.invoiceId || '',
        recipientEmail: data.recipientEmail,
        subject: data.subject,
        message: data.message
      });

      addToast({
        title: response.data.message,
        color: isResponseError(response) ? 'danger' : 'success'
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

      addToast({
        title: response.data.message,
        color: isResponseError(response) ? 'danger' : 'success'
      });

      if (!isResponseError(response)) {
        handleCloseSendDialog();
        router.refresh();
      }
    });

  return (
    <Modal isOpen={isOpen} onClose={handleCloseSendDialog} size="lg">
      <ModalContent>
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
                <Input
                  defaultValue={defaultRecipientEmail}
                  {...register('recipientEmail')}
                  variant="faded"
                  label={t('recipient_email')}
                  placeholder={t('recipient_placeholder')}
                  isInvalid={!!errors.recipientEmail}
                  errorMessage={errors.recipientEmail?.message}
                />
                <Input
                  defaultValue={`Invoice ${invoice.invoiceId} ${invoice.totalAmount ? `- Amount: ${getCurrencySymbol(currency)}${invoice.totalAmount}` : ''}`}
                  {...register('subject')}
                  variant="faded"
                  label={t('subject_label')}
                  placeholder={t('subject_placeholder')}
                  isInvalid={!!errors.subject}
                  errorMessage={errors.subject?.message}
                />
                <Textarea
                  {...register('message')}
                  variant="faded"
                  label={t('message_label')}
                  placeholder={t('message_placeholder')}
                  isInvalid={!!errors.message}
                  errorMessage={errors.message?.message}
                />
                <Card className="none border-default-100 border-2 shadow">
                  <CardBody className="flex flex-col gap-2">
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
                    <p className="text-default-500 mt-2 text-sm">
                      {t('signing_link_note')}
                    </p>
                    {invoice.recipientSigningToken && (
                      <div className="mt-2 flex flex-col gap-2">
                        {invoice.recipientSigningEmail && (
                          <p className="text-default-500 text-sm">
                            {t('active_signing_recipient', {
                              email: invoice.recipientSigningEmail
                            })}
                          </p>
                        )}
                        {invoice.recipientSigningRevokedAt ? (
                          <p className="text-danger text-sm">
                            {t('signing_link_revoked')}
                          </p>
                        ) : invoice.recipientSigningExpiresAt ? (
                          <p className="text-default-500 text-sm">
                            {t('signing_link_expires', {
                              date: new Date(
                                invoice.recipientSigningExpiresAt
                              ).toLocaleDateString()
                            })}
                          </p>
                        ) : null}
                        {shouldRotateSigningLink && (
                          <p className="text-warning text-sm">
                            {t('replacement_link_note')}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {!invoice.recipientSigningRevokedAt && (
                            <Button
                              size="sm"
                              variant="bordered"
                              color="danger"
                              isDisabled={isPending}
                              onPress={() => handleSigningLinkAction('revoke')}
                            >
                              {t('revoke_signing_link')}
                            </Button>
                          )}
                          {!invoice.recipientSignedAt && (
                            <Button
                              size="sm"
                              variant="bordered"
                              isDisabled={isPending}
                              onPress={() =>
                                handleSigningLinkAction('regenerate')
                              }
                            >
                              {t('regenerate_signing_link')}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              </ModalBody>
              <ModalFooter className="w-full">
                <Button
                  onPress={handleCloseSendDialog}
                  variant="light"
                  color="danger"
                >
                  {t('cancel')}
                </Button>
                <Button
                  isDisabled={isPending}
                  isLoading={isPending}
                  endContent={<PaperAirplaneIcon className="h-4 w-4" />}
                  color="secondary"
                  type="submit"
                >
                  {shouldRotateSigningLink
                    ? t('replace_link_and_send')
                    : t('send')}
                </Button>
              </ModalFooter>
            </form>
          )}
        </BlobProvider>
      </ModalContent>
    </Modal>
  );
}
