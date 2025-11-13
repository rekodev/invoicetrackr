'use client';

import { Button, Card, Input } from '@heroui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { EyeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { HOME_PAGE } from '@/lib/constants/pages';
import { InvoiceModel } from '@/lib/types/models/invoice';
import { calculateServiceTotal } from '@/lib/utils';
import { formatDate } from '@/lib/utils/format-date';

import InvoiceModal from './invoice-modal';
import InvoiceServicesTable from './invoice-services-table';
import SignaturePad from '../signature-pad';

const FreeInvoiceForm = () => {
  const t = useTranslations('components.invoice_form');
  const router = useRouter();
  const methods = useForm<InvoiceModel>({
    defaultValues: {
      services: [{ amount: 0, quantity: 0, description: '', unit: '' }]
    }
  });
  const {
    register,
    formState: { errors },
    clearErrors,
    setValue,
    getValues
  } = methods;

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [senderSignature, setSenderSignature] = useState<
    string | File | undefined
  >();

  const senderSignatureImage =
    !senderSignature || typeof senderSignature === 'string'
      ? ''
      : URL.createObjectURL(senderSignature);

  const handleSignatureChange = (signature: string | File) => {
    setSenderSignature(signature);
    setValue('senderSignature', signature);
    clearErrors('senderSignature');
  };

  const renderSenderAndReceiverFields = () => (
    <div className="col-span-4 flex w-full flex-col gap-4">
      <h4>{t('headings.sender_receiver_data')}</h4>
      <div className="col-span-4 flex w-full flex-col justify-between gap-4 md:flex-row">
        <Card className="flex w-full flex-col gap-4 p-4">
          <div className="flex min-h-8 items-center justify-between">
            <p className="text-default-500 text-sm">{t('headings.from')}</p>
          </div>
          <Input
            label={t('labels.sender_name')}
            size="sm"
            aria-label={t('a11y.sender_name_label')}
            type="text"
            maxLength={20}
            defaultValue=""
            variant="bordered"
            {...register('sender.name')}
            isInvalid={!!errors.sender?.name}
            errorMessage={errors.sender?.name?.message}
          />
          <Input
            label={t('labels.sender_business_number')}
            size="sm"
            aria-label={t('a11y.sender_business_number_label')}
            type="text"
            maxLength={20}
            variant="bordered"
            {...register('sender.businessNumber')}
            isInvalid={!!errors.sender?.businessNumber}
            errorMessage={errors.sender?.businessNumber?.message}
          />
          <Input
            label={t('labels.sender_address')}
            size="sm"
            aria-label={t('a11y.sender_address_label')}
            type="text"
            maxLength={20}
            variant="bordered"
            {...register('sender.address')}
            isInvalid={!!errors.sender?.address}
            errorMessage={errors.sender?.address?.message}
          />
          <Input
            label={t('labels.sender_email')}
            size="sm"
            aria-label={t('a11y.sender_email_label')}
            type="text"
            maxLength={20}
            variant="bordered"
            {...register('sender.email')}
            isInvalid={!!errors.sender?.email}
            errorMessage={errors.sender?.email?.message}
          />
        </Card>
        <Card className="flex w-full flex-col gap-4 p-4">
          <div className="flex min-h-8 items-center justify-between">
            <p className="text-default-500 text-sm">{t('headings.to')}</p>
          </div>
          <Input
            label={t('labels.receiver_name')}
            size="sm"
            aria-label={t('a11y.receiver_name_label')}
            type="text"
            maxLength={20}
            variant="bordered"
            {...register('receiver.name')}
            isInvalid={!!errors.receiver?.name}
            errorMessage={errors.receiver?.name?.message}
          />
          <Input
            label={t('labels.receiver_business_number')}
            size="sm"
            aria-label={t('a11y.receiver_business_number_label')}
            type="text"
            maxLength={20}
            variant="bordered"
            {...register('receiver.businessNumber')}
            isInvalid={!!errors.receiver?.businessNumber}
            errorMessage={errors.receiver?.businessNumber?.message}
          />
          <Input
            label={t('labels.receiver_address')}
            size="sm"
            aria-label={t('a11y.receiver_address_label')}
            type="text"
            maxLength={20}
            variant="bordered"
            {...register('receiver.address')}
            isInvalid={!!errors.receiver?.address}
            errorMessage={errors.receiver?.address?.message}
          />
          <Input
            label={t('labels.receiver_email')}
            size="sm"
            aria-label={t('a11y.receiver_email_label')}
            type="text"
            maxLength={20}
            variant="bordered"
            {...register('receiver.email')}
            isInvalid={!!errors.receiver?.email}
            errorMessage={errors.receiver?.email?.message}
          />
        </Card>
      </div>
    </div>
  );

  const renderInvoiceServices = () => (
    <div className="col-span-4 flex flex-col gap-4">
      <h4>{t('services_heading')}</h4>
      <InvoiceServicesTable
        currency="usd"
        isInvalid={!!errors.services}
        errorMessage={errors.services?.message}
      />
    </div>
  );

  const renderBankingInformation = () => (
    <div className="col-span-4 flex flex-col gap-4">
      <h4>{t('banking_details')}</h4>
      <div className="flex flex-col gap-4 md:flex-row">
        <Input
          label={t('labels.bank_name')}
          labelPlacement="inside"
          aria-label={t('a11y.bank_name_label')}
          type="text"
          placeholder={t('placeholders.bank_name')}
          maxLength={20}
          variant="flat"
          {...register('bankingInformation.name')}
          isInvalid={!!errors.bankingInformation?.name}
          errorMessage={errors.bankingInformation?.name?.message}
        />
        <Input
          label={t('labels.bank_code')}
          aria-label={t('a11y.bank_code_label')}
          type="text"
          maxLength={20}
          placeholder={t('placeholders.bank_code')}
          {...register('bankingInformation.code')}
          isInvalid={!!errors.bankingInformation?.code}
          errorMessage={errors.bankingInformation?.code?.message}
        />
        <Input
          label={t('labels.bank_account_number')}
          aria-label={t('a11y.bank_account_number_label')}
          placeholder={t('placeholders.bank_account_number')}
          type="text"
          maxLength={20}
          {...register('bankingInformation.accountNumber')}
          isInvalid={!!errors.bankingInformation?.accountNumber}
          errorMessage={errors.bankingInformation?.accountNumber?.message}
        />
      </div>
    </div>
  );

  const renderInvoiceSignature = () => (
    <div className="col-span-4 flex w-full flex-col gap-4 sm:col-span-1">
      <h4>{t('signature_heading')}</h4>
      <SignaturePad
        signature={senderSignature}
        onSignatureChange={handleSignatureChange}
        isInvalid={!!errors.senderSignature}
        errorMessage={errors.senderSignature?.message as string}
      />
    </div>
  );

  const renderSubmissionMessageAndActions = () => (
    <div className="col-span-4 flex w-full items-center justify-between gap-5 overflow-x-hidden">
      <div className="flex w-full flex-col justify-end gap-1 sm:flex-row">
        <Button
          color="danger"
          variant="light"
          onPress={() => router.push(HOME_PAGE)}
        >
          {t('buttons.cancel')}
        </Button>
        <Button
          type="button"
          color="secondary"
          onPress={() => setIsInvoiceModalOpen(true)}
        >
          <EyeIcon className="h-5 w-5" />
          {t('buttons.preview')}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <FormProvider {...methods}>
        <div className="mx-auto max-w-5xl p-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold">
              {t('free_invoice.title')}
            </h1>
            <p className="text-default-500">{t('free_invoice.description')}</p>
          </div>
          <Card className="dark:border-default-100 mt-8 bg-transparent p-4 sm:p-8 dark:border">
            <form
              aria-label={t('a11y.form_label')}
              className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
              encType="multipart/form-data"
            >
              <div className="col-span-4 flex flex-col gap-4">
                <h4>{t('invoice_details')}</h4>
                <div className="col-span-4 flex flex-col gap-2 md:flex-row">
                  <Input
                    className="w-full"
                    aria-label={t('a11y.invoice_id_label')}
                    {...register('invoiceId')}
                    label={t('labels.invoice_id')}
                    placeholder={t('placeholders.invoice_id')}
                    isInvalid={!!errors.invoiceId}
                    errorMessage={errors.invoiceId?.message}
                  />
                  <Input
                    className="w-full"
                    aria-label={t('a11y.date_label')}
                    {...register('date')}
                    type="date"
                    label={t('labels.date')}
                    defaultValue={formatDate(new Date().toISOString())}
                    errorMessage={errors.date?.message}
                    isInvalid={!!errors.date}
                  />
                  <Input
                    className="w-full"
                    aria-label={t('a11y.due_date_label')}
                    {...register('dueDate')}
                    type="date"
                    label={t('labels.due_date')}
                    isInvalid={!!errors.dueDate}
                    errorMessage={errors.dueDate?.message}
                  />
                </div>
              </div>
              {renderSenderAndReceiverFields()}
              {renderInvoiceServices()}
              {renderBankingInformation()}
              {renderInvoiceSignature()}
              {renderSubmissionMessageAndActions()}
            </form>
          </Card>
        </div>
      </FormProvider>

      <InvoiceModal
        invoiceData={{
          ...getValues(),
          totalAmount: calculateServiceTotal(getValues('services')).toString()
        }}
        currency="usd"
        language="en"
        isOpen={isInvoiceModalOpen}
        senderSignatureImage={senderSignatureImage}
        onOpenChange={setIsInvoiceModalOpen}
      />
    </>
  );
};

export default FreeInvoiceForm;
