'use client';

import {
  Button,
  Card,
  CardBody,
  Form,
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

import { Currency } from '@/lib/types/currency';
import { InvoiceModel } from '@/lib/types/models/invoice';
import { getCurrencySymbol } from '@/lib/utils/currency';
import { sendInvoiceEmail } from '@/api';

type Props = {
  userId: number;
  invoice: InvoiceModel;
  currency: Currency;
};

type SendInvoiceForm = {
  recipientEmail: string;
  subject: string;
  message?: string;
};

export default function SendInvoiceEmailTableAction({
  userId,
  invoice,
  currency
}: Props) {
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
  };

  const onSubmit = (data: SendInvoiceForm) =>
    startTransition(async () => {
      const response = await sendInvoiceEmail({
        userId,
        invoiceId: invoice.id,
        recipientEmail: data.recipientEmail,
        subject: data.subject,
        message: data.message
      });

      addToast({
        title: response.data.message,
        color: response.data.errors ? 'danger' : 'success'
      });

      if (response.data.errors) {
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
      <Tooltip content="Send Invoice">
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
        <ModalContent onSubmit={handleSubmit(onSubmit)} as={Form}>
          <ModalHeader>Send Invoice {invoice.invoiceId}</ModalHeader>
          <ModalBody className="w-full">
            <Input
              defaultValue={invoice.receiver.email}
              {...register('recipientEmail')}
              variant="faded"
              label="Recipient Email"
              type="email"
              placeholder={`Enter recipient's email`}
              isInvalid={!!errors.recipientEmail}
              errorMessage={errors.recipientEmail?.message}
            />
            <Input
              defaultValue={`Invoice ${invoice.invoiceId} ${invoice.totalAmount ? `- Amount: ${getCurrencySymbol(currency)}${invoice.totalAmount}` : ''}`}
              {...register('subject')}
              variant="faded"
              label="Subject"
              placeholder="Enter the subject"
              isInvalid={!!errors.subject}
              errorMessage={errors.subject?.message}
            />
            <Textarea
              {...register('message')}
              variant="faded"
              label="Message (Optional)"
              placeholder="Add a personal message to your client"
              isInvalid={!!errors.message}
              errorMessage={errors.message?.message}
            />
            <Card className="none border-default-100 border-2 shadow">
              <CardBody className="flex flex-col gap-2">
                <p>Invoice Details</p>
                <p className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-default-500 text">Invoice:</span>{' '}
                  {invoice.invoiceId}
                </p>
                <p className="flex items-center justify-between text-sm">
                  <span className="text-default-500 text">Client:</span>{' '}
                  {invoice.receiver.name}
                </p>
                <p className="flex items-center justify-between text-sm">
                  <span className="text-default-500 text">Amount:</span>{' '}
                  {getCurrencySymbol(currency)}
                  {invoice.totalAmount}
                </p>
                <p className="flex items-center justify-between text-sm">
                  <span className="text-default-500 text">Date:</span>
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
              Cancel
            </Button>
            <Button
              isDisabled={isPending}
              isLoading={isPending}
              endContent={<PaperAirplaneIcon className="h-4 w-4" />}
              color="secondary"
              type="submit"
            >
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
