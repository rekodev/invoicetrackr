'use client';

import {
  ArrowRightIcon,
  EyeIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import {
  Alert,
  Button,
  buttonVariants,
  Card,
  Chip,
  FieldError,
  Input,
  Label,
  Link,
  ListBox,
  ListBoxItem,
  Radio,
  RadioGroup,
  Select,
  TextField
} from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { type ComponentProps, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { captureAnalyticsEvent } from '@/lib/analytics/client';
import { analyticsEvents } from '@/lib/analytics/events';
import { SIGN_UP_PAGE } from '@/lib/constants/pages';
import { Currency } from '@/lib/types/currency';
import { calculateInvoiceTotals } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';

import PDFDocument from '../pdf/pdf-document';
import SignaturePad from '../signature-pad';
import InvoiceModal from './invoice-modal';
import InvoiceServicesTable from './invoice-services-table';

type TextInputProps = ComponentProps<typeof Input>;
type TextFieldVariant = ComponentProps<typeof TextField>['variant'];

type Props = {
  language: string;
  currency: Currency;
};

const FreeInvoiceForm = ({ language, currency }: Props) => {
  const t = useTranslations('components.invoice_form');
  const pdfTranslator = useTranslations('invoices.pdf');
  const methods = useForm<InvoiceBody>({
    defaultValues: {
      sender: {
        name: '',
        businessType: 'individual' as const,
        businessNumber: '',
        vatNumber: '',
        address: '',
        email: '',
        type: 'sender' as const
      },
      receiver: {
        name: '',
        businessType: 'business' as const,
        businessNumber: '',
        vatNumber: '',
        address: '',
        email: '',
        type: 'receiver' as const
      },
      services: [
        { amount: 0, quantity: 1, description: '', unit: 'service', vatRate: 0 }
      ],
      bankingInformation: { name: '', code: '', accountNumber: '' },
      cryptoWallet: {
        label: '',
        asset: '',
        network: '',
        address: '',
        memo: ''
      },
      paymentMode: 'manual',
      manualPaymentReference: '',
      status: 'pending',
      totalAmount: '0.00',
      date: formatDate(new Date().toISOString()),
      dueDate: ''
    }
  });
  const {
    register,
    formState: { errors },
    clearErrors,
    setValue,
    getValues,
    control,
    watch
  } = methods;
  const senderBusinessType = watch('sender.businessType');
  const receiverBusinessType = watch('receiver.businessType');
  const paymentMode = watch('paymentMode') || 'manual';

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [senderSignature, setSenderSignature] = useState<
    string | File | undefined
  >();

  const senderSignatureImage =
    !senderSignature || typeof senderSignature === 'string'
      ? ''
      : URL.createObjectURL(senderSignature);
  const signupUrl = `${SIGN_UP_PAGE}?source=free-invoice`;

  const handleSignatureChange = (signature: string | File) => {
    setSenderSignature(signature);
    setValue('senderSignature', signature);
    clearErrors('senderSignature');
  };

  const handleSignupClick = (source: string) => {
    captureAnalyticsEvent(analyticsEvents.freeInvoiceSignUpClicked, {
      source,
      line_count: getValues('services').length
    });
  };

  const renderTextField = ({
    label,
    isInvalid,
    errorMessage,
    variant = 'secondary',
    inputProps
  }: {
    label: string;
    isInvalid: boolean;
    errorMessage?: string;
    variant?: TextFieldVariant;
    inputProps: TextInputProps;
  }) => (
    <TextField variant={variant} isInvalid={isInvalid}>
      <Label>{label}</Label>
      <Input {...inputProps} />
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );

  const renderSenderAndReceiverFields = () => (
    <div className="col-span-4 flex w-full flex-col gap-4">
      <h4>{t('headings.sender_receiver_data')}</h4>
      <div className="col-span-4 flex w-full flex-col justify-between gap-4 md:flex-row">
        <Card
          variant="secondary"
          className="flex w-full flex-col gap-4 border p-4 pb-6"
        >
          <div className="flex min-h-8 items-center justify-between">
            <p className="text-muted text-sm">{t('headings.from')}</p>
          </div>
          <Controller
            name="sender.businessType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                aria-label={t('a11y.sender_business_type_label')}
                orientation="horizontal"
                value={field.value}
                onChange={field.onChange}
              >
                <Radio value="business">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>{t('labels.business_type_business')}</Label>
                  </Radio.Content>
                </Radio>
                <Radio value="individual">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>{t('labels.business_type_individual')}</Label>
                  </Radio.Content>
                </Radio>
              </RadioGroup>
            )}
          />
          {renderTextField({
            label: t('labels.sender_name'),
            isInvalid: !!errors.sender?.name,
            errorMessage: errors.sender?.name?.message,
            variant: 'primary',
            inputProps: {
              'aria-label': t('a11y.sender_name_label'),
              placeholder: t('placeholders.sender_name'),
              type: 'text',
              maxLength: 255,
              ...register('sender.name')
            }
          })}
          {renderTextField({
            label: t(`labels.sender_business_number_${senderBusinessType}`),
            isInvalid: !!errors.sender?.businessNumber,
            errorMessage: errors.sender?.businessNumber?.message,
            variant: 'primary',
            inputProps: {
              'aria-label': t(
                `a11y.sender_business_number_label_${senderBusinessType}`
              ),
              placeholder: t('placeholders.sender_business_number'),
              type: 'text',
              maxLength: 255,
              ...register('sender.businessNumber')
            }
          })}
          {renderTextField({
            label: t('labels.sender_vat_number'),
            isInvalid: !!errors.sender?.vatNumber,
            errorMessage: errors.sender?.vatNumber?.message,
            variant: 'primary',
            inputProps: {
              type: 'text',
              maxLength: 255,
              ...register('sender.vatNumber')
            }
          })}
          {renderTextField({
            label: t('labels.sender_address'),
            isInvalid: !!errors.sender?.address,
            errorMessage: errors.sender?.address?.message,
            variant: 'primary',
            inputProps: {
              'aria-label': t('a11y.sender_address_label'),
              placeholder: t('placeholders.sender_address'),
              type: 'text',
              maxLength: 1000,
              ...register('sender.address')
            }
          })}
          {renderTextField({
            label: t('labels.sender_email'),
            isInvalid: !!errors.sender?.email,
            errorMessage: errors.sender?.email?.message,
            variant: 'primary',
            inputProps: {
              'aria-label': t('a11y.sender_email_label'),
              placeholder: t('placeholders.sender_email'),
              type: 'text',
              maxLength: 255,
              ...register('sender.email')
            }
          })}
        </Card>
        <Card
          variant="secondary"
          className="flex w-full flex-col gap-4 border p-4 pb-6"
        >
          <div className="flex min-h-8 items-center justify-between">
            <p className="text-muted text-sm">{t('headings.to')}</p>
          </div>
          <Controller
            name="receiver.businessType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                aria-label={t('a11y.receiver_business_type_label')}
                orientation="horizontal"
                value={field.value}
                onChange={field.onChange}
              >
                <Radio value="business">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>{t('labels.business_type_business')}</Label>
                  </Radio.Content>
                </Radio>
                <Radio value="individual">
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <Radio.Content>
                    <Label>{t('labels.business_type_individual')}</Label>
                  </Radio.Content>
                </Radio>
              </RadioGroup>
            )}
          />
          {renderTextField({
            label: t('labels.receiver_name'),
            isInvalid: !!errors.receiver?.name,
            errorMessage: errors.receiver?.name?.message,
            variant: 'primary',
            inputProps: {
              'aria-label': t('a11y.receiver_name_label'),
              placeholder: t('placeholders.receiver_name'),
              type: 'text',
              maxLength: 255,
              ...register('receiver.name')
            }
          })}
          {renderTextField({
            label: t(`labels.receiver_business_number_${receiverBusinessType}`),
            isInvalid: !!errors.receiver?.businessNumber,
            errorMessage: errors.receiver?.businessNumber?.message,
            variant: 'primary',
            inputProps: {
              'aria-label': t(
                `a11y.receiver_business_number_label_${receiverBusinessType}`
              ),
              placeholder: t('placeholders.receiver_business_number'),
              type: 'text',
              maxLength: 255,
              ...register('receiver.businessNumber')
            }
          })}
          {renderTextField({
            label: t('labels.receiver_vat_number'),
            isInvalid: !!errors.receiver?.vatNumber,
            errorMessage: errors.receiver?.vatNumber?.message,
            variant: 'primary',
            inputProps: {
              type: 'text',
              maxLength: 255,
              ...register('receiver.vatNumber')
            }
          })}
          {renderTextField({
            label: t('labels.receiver_address'),
            isInvalid: !!errors.receiver?.address,
            errorMessage: errors.receiver?.address?.message,
            variant: 'primary',
            inputProps: {
              'aria-label': t('a11y.receiver_address_label'),
              placeholder: t('placeholders.receiver_address'),
              type: 'text',
              maxLength: 1000,
              ...register('receiver.address')
            }
          })}
          {renderTextField({
            label: t('labels.receiver_email'),
            isInvalid: !!errors.receiver?.email,
            errorMessage: errors.receiver?.email?.message,
            variant: 'primary',
            inputProps: {
              'aria-label': t('a11y.receiver_email_label'),
              placeholder: t('placeholders.receiver_email'),
              type: 'text',
              maxLength: 255,
              ...register('receiver.email')
            }
          })}
        </Card>
      </div>
    </div>
  );

  const renderInvoiceServices = () => (
    <div className="col-span-4 flex flex-col gap-4">
      <h4>{t('services_heading')}</h4>
      <InvoiceServicesTable
        currency={currency}
        isVatEnabled={false}
        isInvalid={!!errors.services}
        errorMessage={errors.services?.message}
      />
    </div>
  );

  const renderBankingInformation = () => (
    <div className="col-span-4 flex flex-col gap-4">
      <h4>{t('payment_settings.title')}</h4>
      <Controller
        name="paymentMode"
        control={control}
        render={({ field }) => (
          <Select
            aria-label={t('a11y.payment_mode_label')}
            variant="secondary"
            value={field.value}
            onChange={(key) => field.onChange(String(key))}
          >
            <Label>{t('labels.payment_mode')}</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {(['manual', 'crypto', 'disabled'] as const).map((mode) => (
                  <ListBoxItem
                    key={mode}
                    id={mode}
                    textValue={t(`payment_settings.modes.${mode}`)}
                  >
                    {t(`payment_settings.modes.${mode}`)}
                    <ListBoxItem.Indicator />
                  </ListBoxItem>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      />
      {paymentMode === 'manual' ? (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {renderTextField({
            label: t('labels.bank_name'),
            isInvalid: !!errors.bankingInformation?.name,
            errorMessage: errors.bankingInformation?.name?.message,
            inputProps: {
              'aria-label': t('a11y.bank_name_label'),
              type: 'text',
              placeholder: t('placeholders.bank_name'),
              maxLength: 255,
              ...register('bankingInformation.name')
            }
          })}
          {renderTextField({
            label: t('labels.bank_code'),
            isInvalid: !!errors.bankingInformation?.code,
            errorMessage: errors.bankingInformation?.code?.message,
            inputProps: {
              'aria-label': t('a11y.bank_code_label'),
              type: 'text',
              maxLength: 100,
              placeholder: t('placeholders.bank_code'),
              ...register('bankingInformation.code')
            }
          })}
          {renderTextField({
            label: t('labels.bank_account_number'),
            isInvalid: !!errors.bankingInformation?.accountNumber,
            errorMessage: errors.bankingInformation?.accountNumber?.message,
            inputProps: {
              'aria-label': t('a11y.bank_account_number_label'),
              placeholder: t('placeholders.bank_account_number'),
              type: 'text',
              maxLength: 100,
              ...register('bankingInformation.accountNumber')
            }
          })}
        </div>
      ) : null}
      {paymentMode === 'crypto' ? (
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          {(['label', 'asset', 'network', 'address', 'memo'] as const).map(
            (name) =>
              renderTextField({
                label: t(`labels.crypto_${name}`),
                isInvalid: !!errors.cryptoWallet?.[name],
                errorMessage: errors.cryptoWallet?.[name]?.message,
                inputProps: {
                  type: 'text',
                  maxLength: name === 'address' || name === 'memo' ? 255 : 100,
                  ...register(`cryptoWallet.${name}`)
                }
              })
          )}
          <p className="text-muted text-xs leading-5 md:col-span-2">
            {t('payment_settings.crypto_note')}
          </p>
        </div>
      ) : null}
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
    <div className="col-span-4 flex w-full justify-end">
      <div className="flex w-full flex-col justify-end gap-2 sm:flex-row lg:w-auto">
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onPress={() => setIsInvoiceModalOpen(true)}
        >
          <EyeIcon className="h-5 w-5" />
          {t('buttons.preview')}
        </Button>
        <Link
          href={signupUrl}
          onClick={() => handleSignupClick('form_actions')}
          className={buttonVariants({
            className: 'w-full justify-center gap-2 sm:w-auto'
          })}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
          {t('free_invoice.signup_cta')}
        </Link>
      </div>
    </div>
  );

  const renderSignupPrompt = () => (
    <Link
      href={signupUrl}
      onClick={() => handleSignupClick('preview_modal')}
      className={buttonVariants({
        size: 'sm',
        className: 'w-full justify-center gap-2 sm:w-auto'
      })}
    >
      {t('free_invoice.modal_cta_button')}
      <ArrowRightIcon className="h-4 w-4" />
    </Link>
  );

  const renderUpgradeAlert = () => (
    <Alert status="accent" className="border">
      <Alert.Indicator />
      <Alert.Content>
        <Alert.Title>{t('free_invoice.upgrade_title')}</Alert.Title>
        <Alert.Description>
          {t('free_invoice.upgrade_description')}
        </Alert.Description>
        <Link
          href={signupUrl}
          onClick={() => handleSignupClick('intro_panel')}
          className={buttonVariants({
            size: 'sm',
            className: 'mt-2 sm:hidden'
          })}
        >
          {t('free_invoice.upgrade_cta')}
        </Link>
      </Alert.Content>
      <Link
        href={signupUrl}
        onClick={() => handleSignupClick('intro_panel')}
        className={buttonVariants({
          size: 'sm',
          className: 'hidden sm:flex'
        })}
      >
        {t('free_invoice.upgrade_cta')}
      </Link>
    </Alert>
  );

  const getInvoicePreviewData = (): InvoiceBody => {
    const invoiceTotals = calculateInvoiceTotals(getValues('services'));

    return {
      ...getValues(),
      lifecycleStatus: getValues('invoiceId') ? 'issued' : 'draft',
      subtotalAmount: invoiceTotals.subtotalAmount,
      vatAmount: invoiceTotals.vatAmount,
      totalAmount: invoiceTotals.totalAmount
    };
  };

  const renderPdfDocument = () => (
    <PDFDocument
      currency={currency}
      invoiceData={getInvoicePreviewData()}
      senderSignatureImage={senderSignatureImage}
      t={pdfTranslator}
      language={language}
    />
  );

  return (
    <>
      <FormProvider {...methods}>
        <div className="mx-auto w-full max-w-7xl px-6 py-8 sm:py-10 md:py-12 lg:py-14">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
            <div className="flex max-w-3xl flex-col gap-3">
              <Chip color="accent" variant="soft" className="w-max">
                {t('free_invoice.eyebrow')}
              </Chip>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                {t('free_invoice.title')}
              </h1>
              <p className="text-muted max-w-2xl">
                {t('free_invoice.description')}
              </p>
              <p className="text-muted max-w-2xl text-sm">
                {t('free_invoice.untracked_notice')}
              </p>
            </div>
            {renderUpgradeAlert()}
          </div>
          <Card className="mt-8 border p-4 sm:p-8">
            <form
              aria-label={t('a11y.form_label')}
              className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
              encType="multipart/form-data"
            >
              <div className="col-span-4 flex flex-col gap-4">
                <h4>{t('invoice_details')}</h4>
                <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
                  {renderTextField({
                    label: t('labels.invoice_id'),
                    isInvalid: !!errors.invoiceId,
                    errorMessage: errors.invoiceId?.message,
                    inputProps: {
                      className: 'w-full',
                      'aria-label': t('a11y.invoice_id_label'),
                      placeholder: t('placeholders.invoice_id'),
                      ...register('invoiceId')
                    }
                  })}
                  {renderTextField({
                    label: t('labels.date'),
                    isInvalid: !!errors.date,
                    errorMessage: errors.date?.message,
                    inputProps: {
                      className: 'w-full',
                      'aria-label': t('a11y.date_label'),
                      type: 'date',
                      ...register('date')
                    }
                  })}
                  {renderTextField({
                    label: t('labels.due_date'),
                    isInvalid: !!errors.dueDate,
                    errorMessage: errors.dueDate?.message,
                    inputProps: {
                      className: 'w-full',
                      'aria-label': t('a11y.due_date_label'),
                      type: 'date',
                      ...register('dueDate')
                    }
                  })}
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
        pdfDocument={renderPdfDocument()}
        invoiceData={getInvoicePreviewData()}
        invoiceLanguage={language}
        isOpen={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
        conversionContent={renderSignupPrompt()}
      />
    </>
  );
};

export default FreeInvoiceForm;
