'use client';

import {
  BuildingLibraryIcon,
  InformationCircleIcon,
  SparklesIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip
} from '@heroui/react';
import type { Client } from '@invoicetrackr/types';
import type {
  BankAccountBody,
  ClientBody,
  InvoiceBody,
  User
} from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { type ComponentProps, useRef, useState, useTransition } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';

import { getNextInvoiceNumberAction } from '@/lib/actions/invoice';
import { statusOptions } from '@/lib/constants/table';
import useInvoiceFormSubmissionHandler from '@/lib/hooks/invoice/use-invoice-form-submission-handler';
import { Currency } from '@/lib/types/currency';
import {
  addDaysToDate,
  formatDate,
  getDateDifferenceInDays
} from '@/lib/utils/date';

import SignaturePad from '../signature-pad';
import CompleteProfile from '../ui/complete-profile';
import BankingInformationDialog from './banking-information-dialog';
import InvoiceDueDatePreselectionChips from './invoice-due-date-preselection-chips';
import InvoiceFormReceiverModal from './invoice-form-receiver-modal';
import InvoiceServicesTable from './invoice-services-table';

type Props = {
  user: User;
  clients: Array<ClientBody>;
  bankingInformationEntries: Array<BankAccountBody>;
  invoiceData?: InvoiceBody;
  currency: Currency;
};

type TextInputProps = ComponentProps<typeof Input>;
type TextFieldProps = ComponentProps<typeof TextField>;
type TextFieldVariant = TextFieldProps['variant'];

const INITIAL_RECEIVER_DATA: Client = {
  id: 0,
  businessNumber: '',
  businessType: 'business',
  address: '',
  email: '',
  name: '',
  vatNumber: '',
  type: 'receiver'
};

const paymentModeOptions = ['manual', 'disabled'] as const;

const getMvpPaymentMode = (paymentMode?: InvoiceBody['paymentMode']) =>
  paymentMode === 'disabled' ? 'disabled' : 'manual';

const getDefaultVatRate = (user: User) => {
  if (!user.isVatPayer) return 0;
  if (user.defaultInvoiceVatMode === 'standard_21') return 21;

  return 0;
};

const hasVatDetails = (services?: InvoiceBody['services']) =>
  Boolean(
    services?.some(
      (service) =>
        Number(service.vatRate ?? 0) > 0 || Boolean(service.vatExemptionReason)
    )
  );

const InvoiceForm = ({
  user,
  currency,
  invoiceData,
  clients,
  bankingInformationEntries
}: Props) => {
  const t = useTranslations('components.invoice_form');
  const today = formatDate(new Date().toISOString());
  const defaultPaymentTermsDays = user.defaultPaymentTermsDays || 30;
  const defaultVatRate = getDefaultVatRate(user);
  const isVatEnabled = user.isVatPayer || hasVatDetails(invoiceData?.services);
  const defaultSenderSignature =
    invoiceData?.senderSignature || user.signature || undefined;
  const emptyBankingInformation = {
    name: '',
    code: '',
    accountNumber: ''
  };
  const selectedBankAccount =
    bankingInformationEntries.find(
      (bankAccount) => bankAccount.id === user.selectedBankAccountId
    ) || bankingInformationEntries.at(0);
  const defaultBankingInformation =
    invoiceData?.bankingInformation ||
    selectedBankAccount ||
    emptyBankingInformation;
  const methods = useForm<InvoiceBody>({
    defaultValues: invoiceData
      ? {
          ...invoiceData,
          paymentMode: getMvpPaymentMode(invoiceData.paymentMode),
          date: invoiceData.date ? formatDate(invoiceData.date) : today,
          dueDate: invoiceData.dueDate ? formatDate(invoiceData.dueDate) : ''
        }
      : {
          sender: {
            ...user,
            email: user.invoiceEmail || user.email,
            logoUrl: user.profilePictureUrl || '',
            type: 'sender',
            vatNumber: user.vatNumber || ''
          },
          receiver: INITIAL_RECEIVER_DATA,
          services: [
            {
              amount: 0,
              quantity: 0,
              description: '',
              unit: '',
              vatRate: defaultVatRate
            }
          ],
          bankingInformation: defaultBankingInformation,
          status: 'pending',
          paymentMode: 'manual',
          manualPaymentReference: '',
          date: today,
          dueDate: addDaysToDate(today, defaultPaymentTermsDays),
          senderSignature: defaultSenderSignature || ''
        }
  });
  const {
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    clearErrors,
    setValue,
    control,
    watch
  } = methods;

  const [isReceiverModalOpen, setIsReceiverModalOpen] = useState(false);
  const [isBankingInformationModalOpen, setIsBankingInformationModalOpen] =
    useState(false);
  const [senderSignature, setSenderSignature] = useState<
    string | File | undefined
  >(defaultSenderSignature);
  const [isNextInvoiceNumberPending, startNextInvoiceNumberTransition] =
    useTransition();

  const { onSubmit, redirectToInvoicesPage } = useInvoiceFormSubmissionHandler({
    invoiceData,
    user,
    setError
  });

  const dueDateInputRef = useRef<HTMLInputElement | null>(null);

  // eslint-disable-next-line react-hooks/incompatible-library
  const isReceiverBusiness = watch('receiver.businessType') === 'business';
  const isSenderBusiness = watch('sender.businessType') === 'business';
  const paymentMode = watch('paymentMode') || 'manual';
  const currentDate = watch('date');
  const senderVatNumber = watch('sender.vatNumber');
  const shouldShowSenderVatNumber = isVatEnabled || !!senderVatNumber;

  const handleOpenReceiverModal = () => {
    setIsReceiverModalOpen(true);
  };

  const handleCloseReceiverModal = () => {
    setIsReceiverModalOpen(false);
  };

  const handleSelectReceiver = (receiver: ClientBody) => {
    setValue('receiver.businessType', receiver.businessType);
    setValue('receiver.name', receiver.name);
    setValue('receiver.businessNumber', receiver.businessNumber);
    setValue('receiver.vatNumber', isVatEnabled ? receiver.vatNumber : '');
    setValue('receiver.address', receiver.address);
    setValue('receiver.email', receiver.email);
    clearErrors('receiver');
    setIsReceiverModalOpen(false);
  };

  const handleBankAccountSelect = (bankAccount: BankAccountBody) => {
    setValue('bankingInformation.name', bankAccount.name);
    setValue('bankingInformation.code', bankAccount.code);
    setValue('bankingInformation.accountNumber', bankAccount.accountNumber);
    clearErrors('bankingInformation');
    setIsBankingInformationModalOpen(false);
  };

  const applyDefaultBankAccount = () => {
    if (!selectedBankAccount) return;

    setValue('bankingInformation.name', selectedBankAccount.name);
    setValue('bankingInformation.code', selectedBankAccount.code);
    setValue(
      'bankingInformation.accountNumber',
      selectedBankAccount.accountNumber
    );
    clearErrors('bankingInformation');
  };

  const handleSignatureChange = (signature: string | File) => {
    setSenderSignature(signature);
    setValue('senderSignature', signature, { shouldDirty: true });
    clearErrors('senderSignature');
  };

  const handleNextInvoiceIdSelect = () => {
    startNextInvoiceNumberTransition(async () => {
      const response = await getNextInvoiceNumberAction({
        userId: user.id || 0
      });

      if (!response.ok) return;

      setValue('invoiceId', response.invoiceId, { shouldDirty: true });
      setValue('invoiceSeries', response.series, { shouldDirty: true });
      clearErrors('invoiceId');
    });
  };

  const renderTextField = ({
    label,
    isInvalid,
    isDisabled = false,
    errorMessage,
    tooltip,
    variant = 'secondary',
    inputProps
  }: {
    label: string;
    isInvalid: boolean;
    isDisabled?: TextFieldProps['isDisabled'];
    errorMessage?: string;
    tooltip?: string;
    variant?: TextFieldVariant;
    inputProps: TextInputProps;
  }) => (
    <TextField
      className="w-full"
      variant={variant}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
    >
      <div className="flex items-center gap-1">
        <Label>{label}</Label>
        {tooltip && (
          <Tooltip delay={0}>
            <Tooltip.Trigger>
              <button
                type="button"
                aria-label={tooltip}
                className="text-muted hover:text-foreground cursor-pointer"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content>{tooltip}</Tooltip.Content>
          </Tooltip>
        )}
      </div>
      <Input {...inputProps} />
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );

  const renderBusinessTypeOptions = () => (
    <>
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
    </>
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
            <p className="text-muted section-eyebrow">{t('headings.from')}</p>
          </div>
          <Controller
            name="sender.businessType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                aria-label={t('a11y.sender_business_type_label')}
                variant="primary"
                orientation="horizontal"
                {...field}
              >
                {renderBusinessTypeOptions()}
              </RadioGroup>
            )}
          />
          <Controller
            name="sender.name"
            control={control}
            render={({ field }) =>
              renderTextField({
                label: t('labels.sender_name'),
                isInvalid: !!errors.sender?.name,
                errorMessage: errors.sender?.name?.message,
                variant: 'primary',
                inputProps: {
                  ...field,
                  value: field.value || '',
                  'aria-label': t('a11y.sender_name_label'),
                  placeholder: t('placeholders.sender_name'),
                  maxLength: 20
                }
              })
            }
          />
          <Controller
            name="sender.businessNumber"
            control={control}
            render={({ field }) =>
              renderTextField({
                label: t(
                  `labels.sender_business_number_${isSenderBusiness ? 'business' : 'individual'}`
                ),
                isInvalid: !!errors.sender?.businessNumber,
                errorMessage: errors.sender?.businessNumber?.message,
                variant: 'primary',
                inputProps: {
                  ...field,
                  value: field.value || '',
                  'aria-label': t(
                    `a11y.sender_business_number_label_${isSenderBusiness ? 'business' : 'individual'}`
                  ),
                  placeholder: t('placeholders.sender_business_number'),
                  maxLength: 20
                }
              })
            }
          />
          {shouldShowSenderVatNumber && (
            <Controller
              name="sender.vatNumber"
              control={control}
              render={({ field }) =>
                renderTextField({
                  label: t('labels.sender_vat_number'),
                  isInvalid: !!errors.sender?.vatNumber,
                  errorMessage: errors.sender?.vatNumber?.message,
                  variant: 'primary',
                  inputProps: {
                    ...field,
                    value: field.value || '',
                    'aria-label': t('a11y.sender_vat_number_label'),
                    placeholder: t('placeholders.sender_vat_number'),
                    maxLength: 20
                  }
                })
              }
            />
          )}
          <Controller
            name="sender.address"
            control={control}
            render={({ field }) =>
              renderTextField({
                label: t('labels.sender_address'),
                isInvalid: !!errors.sender?.address,
                errorMessage: errors.sender?.address?.message,
                variant: 'primary',
                inputProps: {
                  ...field,
                  value: field.value || '',
                  'aria-label': t('a11y.sender_address_label'),
                  placeholder: t('placeholders.sender_address'),
                  maxLength: 20
                }
              })
            }
          />
          <Controller
            name="sender.email"
            control={control}
            render={({ field }) =>
              renderTextField({
                label: t('labels.sender_email'),
                isInvalid: !!errors.sender?.email,
                errorMessage: errors.sender?.email?.message,
                variant: 'primary',
                inputProps: {
                  ...field,
                  value: field.value || '',
                  'aria-label': t('a11y.sender_email_label'),
                  placeholder: t('placeholders.sender_email'),
                  maxLength: 20
                }
              })
            }
          />
        </Card>
        <Card
          variant="secondary"
          className="flex w-full flex-col gap-4 border p-4 pb-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-muted section-eyebrow">{t('headings.to')}</p>
            <Button
              size="sm"
              variant="secondary"
              className="bg-background-tertiary min-w-unit-10 w-unit-26 h-unit-8 cursor-pointer"
              onPress={handleOpenReceiverModal}
            >
              <UserGroupIcon className="h-4 w-4" />
              {t('modals.select_client')}
            </Button>
          </div>
          <Controller
            name="receiver.businessType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                aria-label={t('a11y.receiver_business_type_label')}
                variant="primary"
                orientation="horizontal"
                {...field}
              >
                {renderBusinessTypeOptions()}
              </RadioGroup>
            )}
          />
          <Controller
            name="receiver.name"
            control={control}
            render={({ field }) =>
              renderTextField({
                label: t('labels.receiver_name'),
                isInvalid: !!errors.receiver?.name,
                errorMessage: errors.receiver?.name?.message,
                variant: 'primary',
                inputProps: {
                  ...field,
                  'aria-label': t('a11y.receiver_name_label'),
                  placeholder: t('placeholders.receiver_name'),
                  type: 'text',
                  maxLength: 20
                }
              })
            }
          />
          <Controller
            name="receiver.businessNumber"
            control={control}
            render={({ field }) =>
              renderTextField({
                label: t(
                  `labels.receiver_business_number_${isReceiverBusiness ? 'business' : 'individual'}`
                ),
                isInvalid: !!errors.receiver?.businessNumber,
                errorMessage: errors.receiver?.businessNumber?.message,
                variant: 'primary',
                inputProps: {
                  ...field,
                  'aria-label': t(
                    `a11y.receiver_business_number_label_${isReceiverBusiness ? 'business' : 'individual'}`
                  ),
                  placeholder: t('placeholders.receiver_business_number'),
                  type: 'text'
                }
              })
            }
          />
          {isVatEnabled && isReceiverBusiness && (
            <Controller
              name="receiver.vatNumber"
              control={control}
              render={({ field }) =>
                renderTextField({
                  label: t('labels.receiver_vat_number'),
                  isInvalid: !!errors.receiver?.vatNumber,
                  errorMessage: errors.receiver?.vatNumber?.message,
                  variant: 'primary',
                  inputProps: {
                    ...field,
                    value: field.value || '',
                    'aria-label': t('a11y.receiver_vat_number_label'),
                    placeholder: t('placeholders.receiver_vat_number'),
                    type: 'text'
                  }
                })
              }
            />
          )}
          <Controller
            name="receiver.address"
            control={control}
            render={({ field }) =>
              renderTextField({
                label: t('labels.receiver_address'),
                isInvalid: !!errors.receiver?.address,
                errorMessage: errors.receiver?.address?.message,
                variant: 'primary',
                inputProps: {
                  ...field,
                  'aria-label': t('a11y.receiver_address_label'),
                  placeholder: t('placeholders.receiver_address'),
                  type: 'text'
                }
              })
            }
          />
          <Controller
            name="receiver.email"
            control={control}
            render={({ field }) =>
              renderTextField({
                label: t('labels.receiver_email'),
                isInvalid: !!errors.receiver?.email,
                errorMessage: errors.receiver?.email?.message,
                variant: 'primary',
                inputProps: {
                  ...field,
                  'aria-label': t('a11y.receiver_email_label'),
                  placeholder: t('placeholders.receiver_email'),
                  type: 'text'
                }
              })
            }
          />
        </Card>
      </div>
    </div>
  );

  const renderInvoiceServices = () => (
    <div className="col-span-4 flex flex-col gap-4">
      <h4>{t('services_heading')}</h4>
      <InvoiceServicesTable
        currency={currency}
        invoiceServices={invoiceData?.services}
        defaultVatRate={defaultVatRate}
        isVatEnabled={isVatEnabled}
        isInvalid={!!errors.services}
        errorMessage={errors.services?.message}
      />
    </div>
  );

  const renderBankingInformationFields = () => (
    <>
      <Controller
        name="bankingInformation.name"
        control={control}
        render={({ field }) =>
          renderTextField({
            label: t('labels.bank_name'),
            isInvalid: !!errors.bankingInformation?.name,
            errorMessage: errors.bankingInformation?.name?.message,
            inputProps: {
              ...field,
              value: field.value || '',
              'aria-label': t('a11y.bank_name_label'),
              type: 'text',
              placeholder: t('placeholders.bank_name'),
              maxLength: 20
            }
          })
        }
      />

      <Controller
        name="bankingInformation.code"
        control={control}
        render={({ field }) =>
          renderTextField({
            label: t('labels.bank_code'),
            isInvalid: !!errors.bankingInformation?.code,
            errorMessage: errors.bankingInformation?.code?.message,
            inputProps: {
              ...field,
              value: field.value || '',
              'aria-label': t('a11y.bank_code_label'),
              type: 'text',
              maxLength: 20,
              placeholder: t('placeholders.bank_code')
            }
          })
        }
      />

      <Controller
        name="bankingInformation.accountNumber"
        control={control}
        render={({ field }) =>
          renderTextField({
            label: t('labels.bank_account_number'),
            isInvalid: !!errors.bankingInformation?.accountNumber,
            errorMessage: errors.bankingInformation?.accountNumber?.message,
            inputProps: {
              ...field,
              value: field.value || '',
              'aria-label': t('a11y.bank_account_number_label'),
              placeholder: t('placeholders.bank_account_number'),
              type: 'text',
              maxLength: 20
            }
          })
        }
      />
    </>
  );

  const renderPaymentSettings = () => (
    <div className="col-span-4 flex flex-col gap-3">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <h4>{t('payment_settings.title')}</h4>
        <Button
          size="sm"
          variant="secondary"
          className="h-unit-9 min-w-unit-10 sm:h-unit-8 sm:w-unit-26 w-full sm:max-w-min"
          isDisabled={paymentMode === 'disabled'}
          onPress={() => setIsBankingInformationModalOpen(true)}
        >
          <BuildingLibraryIcon className="min-h-4 min-w-4" />
          {t('modals.select_bank_account')}
        </Button>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
        <Controller
          name="paymentMode"
          control={control}
          render={({ field }) => (
            <Select
              className="w-full"
              aria-label={t('a11y.payment_mode_label')}
              variant="secondary"
              value={getMvpPaymentMode(field.value)}
              onChange={(key) => {
                const selectedPaymentMode = getMvpPaymentMode(
                  String(key || 'manual') as InvoiceBody['paymentMode']
                );

                field.onChange(selectedPaymentMode);
                if (selectedPaymentMode === 'disabled') {
                  setValue('manualPaymentReference', '', {
                    shouldDirty: true
                  });
                  clearErrors(['manualPaymentReference', 'bankingInformation']);
                } else {
                  applyDefaultBankAccount();
                }
              }}
              isInvalid={!!errors.paymentMode}
            >
              <Label>{t('labels.payment_mode')}</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {paymentModeOptions.map((option) => (
                    <ListBoxItem
                      key={option}
                      id={option}
                      textValue={t(`payment_settings.modes.${option}`)}
                    >
                      {t(`payment_settings.modes.${option}`)}
                      <ListBoxItem.Indicator />
                    </ListBoxItem>
                  ))}
                </ListBox>
              </Select.Popover>
              <FieldError>{errors.paymentMode?.message}</FieldError>
              {paymentMode === 'disabled' && (
                <p className="text-muted text-xs leading-5">
                  {t('payment_settings.disabled_note')}
                </p>
              )}
            </Select>
          )}
        />
        {paymentMode === 'manual' && (
          <Controller
            name="manualPaymentReference"
            control={control}
            render={({ field }) =>
              renderTextField({
                label: t('labels.manual_payment_reference'),
                isInvalid: !!errors.manualPaymentReference,
                errorMessage: errors.manualPaymentReference?.message,
                tooltip: t('payment_settings.reference_note'),
                inputProps: {
                  ...field,
                  value: field.value || '',
                  'aria-label': t('a11y.manual_payment_reference_label'),
                  placeholder: t('placeholders.manual_payment_reference'),
                  type: 'text',
                  maxLength: 255
                }
              })
            }
          />
        )}
        {paymentMode === 'manual' && renderBankingInformationFields()}
      </div>
    </div>
  );

  const renderInvoiceSignature = () => (
    <div className="col-span-4 flex flex-col gap-4 sm:col-span-1">
      <h4>{t('signature_heading')}</h4>
      <SignaturePad
        signature={senderSignature}
        profileSignature={user?.signature as string | undefined}
        onSignatureChange={handleSignatureChange}
        isInvalid={!!errors.senderSignature}
        errorMessage={errors.senderSignature?.message as string}
        isChipVisible={user?.signature !== senderSignature}
      />
    </div>
  );

  const renderActions = () => (
    <div className="col-span-4 flex w-full items-center justify-between gap-5">
      <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
        <Button
          variant="ghost"
          className="w-full sm:w-auto"
          onPress={redirectToInvoicesPage}
        >
          {t('buttons.cancel')}
        </Button>
        <Button
          isDisabled={!methods.formState.isDirty || isSubmitting}
          type="submit"
          className="w-full sm:w-auto"
        >
          {t('buttons.save')}
        </Button>
      </div>
    </div>
  );

  if (
    !user?.name ||
    !user?.businessNumber ||
    !user?.businessType ||
    !user?.address ||
    !user?.email
  )
    return <CompleteProfile title="invoice" />;

  return (
    <>
      <FormProvider {...methods}>
        <Card className="border p-4 sm:p-8">
          <form
            aria-label={t('a11y.form_label')}
            className="grid w-full grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
          >
            <div className="col-span-4 flex flex-col gap-4">
              <h4>{t('invoice_details')}</h4>
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-4">
                <Controller
                  name="invoiceId"
                  control={control}
                  defaultValue={invoiceData?.invoiceId || ''}
                  render={({ field }) => (
                    <TextField
                      className="w-full"
                      variant="secondary"
                      isInvalid={!!errors.invoiceId}
                    >
                      <Label>{t('labels.invoice_id')}</Label>
                      <div className="relative">
                        <Input
                          {...field}
                          onChange={(event) => {
                            setValue('invoiceSeries', undefined, {
                              shouldDirty: true
                            });
                            field.onChange(event);
                          }}
                          className="w-full pr-28"
                          aria-label={t('a11y.invoice_id_label')}
                          placeholder={t('placeholders.invoice_id')}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="absolute right-1 top-1/2 h-8 min-w-0 -translate-y-1/2 gap-1 px-2"
                          onPress={handleNextInvoiceIdSelect}
                          isPending={isNextInvoiceNumberPending}
                        >
                          {!isNextInvoiceNumberPending && (
                            <SparklesIcon className="h-4 w-4 shrink-0" />
                          )}
                          {t('buttons.use_next')}
                        </Button>
                      </div>
                      <FieldError>{errors.invoiceId?.message}</FieldError>
                    </TextField>
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select
                      className="w-full"
                      aria-label={t('a11y.status_label')}
                      variant="secondary"
                      value={field.value || 'pending'}
                      onChange={field.onChange}
                      isInvalid={!!errors.status}
                    >
                      <Label>{t('labels.status')}</Label>
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {statusOptions.map((option) => (
                            <ListBoxItem
                              key={option.uid}
                              id={option.uid}
                              textValue={option.name}
                            >
                              {option.name}
                              <ListBoxItem.Indicator />
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </Select.Popover>
                      <FieldError>{errors.status?.message}</FieldError>
                    </Select>
                  )}
                />
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) =>
                    renderTextField({
                      label: t('labels.date'),
                      isInvalid: !!errors.date,
                      errorMessage: errors.date?.message,
                      inputProps: {
                        ...field,
                        value: field.value || today,
                        'aria-label': t('a11y.date_label'),
                        type: 'date'
                      }
                    })
                  }
                />
                <div className="relative w-full">
                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <>
                        <InvoiceDueDatePreselectionChips
                          dateDiffFromDueDate={getDateDifferenceInDays(
                            currentDate,
                            field.value
                          )}
                          onDueDatePreselectionChange={(
                            dueDatePreselection
                          ) => {
                            const currentDatePlusDays = new Date(currentDate);

                            if (dueDatePreselection === 'custom') {
                              field.onChange('');
                              dueDateInputRef.current?.showPicker();

                              return;
                            }

                            currentDatePlusDays.setDate(
                              currentDatePlusDays.getDate() +
                                Number(dueDatePreselection)
                            );

                            const formattedDate = formatDate(
                              currentDatePlusDays.toISOString()
                            );

                            field.onChange(formattedDate);
                          }}
                        />
                        <TextField
                          className="w-full"
                          variant="secondary"
                          isInvalid={!!errors.dueDate}
                        >
                          <Label>{t('labels.due_date')}</Label>
                          <Input
                            {...field}
                            ref={dueDateInputRef}
                            value={field.value || ''}
                            aria-label={t('a11y.due_date_label')}
                            type="date"
                          />
                          <FieldError>{errors.dueDate?.message}</FieldError>
                        </TextField>
                      </>
                    )}
                  />
                </div>
              </div>
            </div>
            {renderSenderAndReceiverFields()}
            {renderInvoiceServices()}
            {renderPaymentSettings()}
            {renderInvoiceSignature()}
            {renderActions()}
          </form>
        </Card>
      </FormProvider>

      <InvoiceFormReceiverModal
        userId={user.id || 0}
        isOpen={isReceiverModalOpen}
        clients={clients}
        onClose={handleCloseReceiverModal}
        onReceiverSelect={handleSelectReceiver}
      />
      <BankingInformationDialog
        userId={user.id || 0}
        isOpen={isBankingInformationModalOpen}
        onClose={() => setIsBankingInformationModalOpen(false)}
        bankingInformationEntries={bankingInformationEntries}
        onBankAccountSelect={handleBankAccountSelect}
      />
    </>
  );
};

export default InvoiceForm;
