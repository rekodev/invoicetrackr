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
  Tooltip,
  addToast
} from '@heroui/react';
import { useState, useTransition } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { Currency } from '@/lib/types/currency';
import { InvoiceModel } from '@/lib/types/models/invoice';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { isResponseError } from '@/lib/utils/error';
import { sendInvoiceEmail } from '@/api';

type Props = {
  userId: number;
  invoice: InvoiceModel;
  currency: Currency;
  blob: Blob | null;
};

type SendInvoiceForm = {
  recipientEmail: string;
  subject: string;
  message?: string;
};

export default function SendInvoiceEmailTableAction({
  blob,
  userId,
  invoice,
  currency
}: Props) {
  const t = useTranslations('components.send_invoice_email');
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors }
  } = useForm<SendInvoiceForm>();

  const handleOpenSendDialog = () => {
    setIsSendDialogOpen(true);
  };

  const handleCloseSendDialog = () => {
    setIsSendDialogOpen(false);
    reset();
  };

  const onSubmit = (data: SendInvoiceForm) =>
    startTransition(async () => {
      const response = await sendInvoiceEmail({
        id: invoice.id,
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

      setIsSendDialogOpen(false);
      reset();
    });

  return (
    <>
      <Tooltip content={t('tooltip')}>
        <span
          onClick={handleOpenSendDialog}
          className="text-default-400 cursor-pointer text-lg active:opacity-50"
        >
          <PaperAirplaneIcon className="text-primary h-4 w-4" />
        </span>
      </Tooltip>

      <Modal
        isOpen={isSendDialogOpen}
        onOpenChange={setIsSendDialogOpen}
        onClose={handleCloseSendDialog}
        size="lg"
      >
        <ModalContent>
          <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
            <ModalHeader>
              {t('modal_title', { invoiceId: invoice.invoiceId })}
            </ModalHeader>
            <ModalBody className="w-full">
              <Input
                defaultValue={invoice.receiver.email}
                {...register('recipientEmail')}
                variant="faded"
                label={t('recipient_email')}
                type="email"
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
                    <span className="text-default-500 text">{t('date')}:</span>
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
        </ModalContent>
      </Modal>
    </>
  );
}
