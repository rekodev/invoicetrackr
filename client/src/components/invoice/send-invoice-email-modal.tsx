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
import { useTranslations } from 'next-intl';

import { Currency } from '@/lib/types/currency';
import { InvoiceBody } from '@invoicetrackr/types';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { isResponseError } from '@/lib/utils/error';
import { sendInvoiceEmail } from '@/api/invoice';

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
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<SendInvoiceForm>();

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
        invoiceId: invoice.invoiceId,
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
    });

  return (
    <Modal isOpen={isOpen} onClose={handleCloseSendDialog} size="lg">
      <ModalContent>
        <BlobProvider document={pdfDocument}>
          {({ blob }) => (
            <form
              onSubmit={handleSubmit((data) => onSubmit(data, blob))}
              encType="multipart/form-data"
            >
              <ModalHeader>
                {t('modal_title', { invoiceId: invoice.invoiceId })}
              </ModalHeader>
              <ModalBody className="w-full">
                <Input
                  defaultValue={invoice.receiver.email}
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
                  {t('send')}
                </Button>
              </ModalFooter>
            </form>
          )}
        </BlobProvider>
      </ModalContent>
    </Modal>
  );
}
