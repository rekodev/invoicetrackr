'use client';

import {
  BuildingLibraryIcon,
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
  TextField
} from '@heroui/react';
import { type ComponentProps, useRef, useState, useTransition } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import type { Client } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';

import type {
  BankAccountBody,
  ClientBody,
  InvoiceBody,
  User
} from '@invoicetrackr/types';
import { formatDate, getDateDifferenceInDays } from '@/lib/utils/date';
import { Currency } from '@/lib/types/currency';
import { getNextInvoiceNumberAction } from '@/lib/actions/invoice';
import { statusOptions } from '@/lib/constants/table';
import useInvoiceFormSubmissionHandler from '@/lib/hooks/invoice/use-invoice-form-submission-handler';

import BankingInformationDialog from './banking-information-dialog';
import CompleteProfile from '../ui/complete-profile';
import InvoiceDueDatePreselectionChips from './invoice-due-date-preselection-chips';
import InvoiceFormReceiverModal from './invoice-form-receiver-modal';
import InvoiceServicesTable from './invoice-services-table';
import SignaturePad from '../signature-pad';

type Props = {
  user: User;
  clients: Array<ClientBody>;
  bankingInformationEntries: Array<BankAccountBody>;
  invoiceData?: InvoiceBody;
  currency: Currency;
};

type TextInputProps = ComponentProps<typeof Input>;

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

const InvoiceForm = ({
  user,
  currency,
  invoiceData,
  clients,
  bankingInformationEntries
}: Props) => {
  const t = useTranslations('components.invoice_form');
  const methods = useForm<InvoiceBody>({
    defaultValues: invoiceData
      ? {
          ...invoiceData,
          date: invoiceData.date
            ? formatDate(invoiceData.date)
            : formatDate(new Date().toISOString()),
          dueDate: invoiceData.dueDate ? formatDate(invoiceData.dueDate) : ''
        }
      : {
          sender: user,
          receiver: INITIAL_RECEIVER_DATA,
          services: [
            { amount: 0, quantity: 0, description: '', unit: '', vatRate: 0 }
          ],
          bankingInformation: { name: '', code: '', accountNumber: '' },
          status: 'pending',
          date: formatDate(new Date().toISOString()),
          dueDate: ''
        }
  });
  const {
    register,
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
  >(invoiceData?.senderSignature);
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
  const currentDate = watch('date');

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
    setValue('receiver.vatNumber', receiver.vatNumber);
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
    errorMessage,
    inputProps
  }: {
    label: string;
    isInvalid: boolean;
    errorMessage?: string;
    inputProps: TextInputProps;
  }) => (
    <TextField className="w-full" variant="secondary" isInvalid={isInvalid}>
      <Label>{label}</Label>
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
        <Card className="flex w-full flex-col gap-4 border p-4 pb-6">
          <div className="flex min-h-8 items-center justify-between">
            <p className="text-muted text-sm">{t('headings.from')}</p>
          </div>
          <Controller
            name="sender.businessType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                aria-label={t('a11y.sender_business_type_label')}
                variant="secondary"
                orientation="horizontal"
                {...field}
              >
                {renderBusinessTypeOptions()}
              </RadioGroup>
            )}
          />
          {renderTextField({
            label: t('labels.sender_name'),
            isInvalid: !!errors.sender?.name,
            errorMessage: errors.sender?.name?.message,
            inputProps: {
              'aria-label': t('a11y.sender_name_label'),
              placeholder: t('placeholders.sender_name'),
              maxLength: 20,
              ...register('sender.name')
            }
          })}
          {renderTextField({
            label: t(
              `labels.sender_business_number_${isSenderBusiness ? 'business' : 'individual'}`
            ),
            isInvalid: !!errors.sender?.businessNumber,
            errorMessage: errors.sender?.businessNumber?.message,
            inputProps: {
              'aria-label': t(
                `a11y.sender_business_number_label_${isSenderBusiness ? 'business' : 'individual'}`
              ),
              placeholder: t('placeholders.sender_business_number'),
              maxLength: 20,
              ...register('sender.businessNumber')
            }
          })}
          {isSenderBusiness &&
            renderTextField({
              label: t('labels.sender_vat_number'),
              isInvalid: !!errors.sender?.vatNumber,
              errorMessage: errors.sender?.vatNumber?.message,
              inputProps: {
                'aria-label': t('a11y.sender_vat_number_label'),
                placeholder: t('placeholders.sender_vat_number'),
                maxLength: 20,
                ...register('sender.vatNumber')
              }
            })}
          {renderTextField({
            label: t('labels.sender_address'),
            isInvalid: !!errors.sender?.address,
            errorMessage: errors.sender?.address?.message,
            inputProps: {
              'aria-label': t('a11y.sender_address_label'),
              placeholder: t('placeholders.sender_address'),
              maxLength: 20,
              ...register('sender.address')
            }
          })}
          {renderTextField({
            label: t('labels.sender_email'),
            isInvalid: !!errors.sender?.email,
            errorMessage: errors.sender?.email?.message,
            inputProps: {
              'aria-label': t('a11y.sender_email_label'),
              placeholder: t('placeholders.sender_email'),
              maxLength: 20,
              ...register('sender.email')
            }
          })}
        </Card>
        <Card className="flex w-full flex-col gap-4 border p-4 pb-6">
          <div className="flex items-center justify-between">
            <p className="text-muted text-sm">{t('headings.to')}</p>
            <Button
              size="sm"
              variant="secondary"
              className="min-w-unit-10 w-unit-26 h-unit-8 cursor-pointer"
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
                variant="secondary"
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
          {isReceiverBusiness && (
            <Controller
              name="receiver.vatNumber"
              control={control}
              render={({ field }) =>
                renderTextField({
                  label: t('labels.receiver_vat_number'),
                  isInvalid: !!errors.receiver?.vatNumber,
                  errorMessage: errors.receiver?.vatNumber?.message,
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
        isInvalid={!!errors.services}
        errorMessage={errors.services?.message}
      />
    </div>
  );

  const renderBankingInformation = () => (
    <div className="col-span-4 flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <h4>{t('banking_details')}</h4>
        <Button
          size="sm"
          variant="secondary"
          className="min-w-unit-10 w-unit-26 h-unit-8 max-w-min cursor-pointer"
          onPress={() => setIsBankingInformationModalOpen(true)}
        >
          <BuildingLibraryIcon className="min-h-4 min-w-4" />
          {t('modals.select_bank_account')}
        </Button>
      </div>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
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
                'aria-label': t('a11y.bank_account_number_label'),
                placeholder: t('placeholders.bank_account_number'),
                type: 'text',
                maxLength: 20
              }
            })
          }
        />
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
      <div className="flex w-full flex-col justify-end gap-1 sm:flex-row">
        <Button variant="danger-soft" onPress={redirectToInvoicesPage}>
          {t('buttons.cancel')}
        </Button>
        <Button
          isDisabled={!methods.formState.isDirty || isSubmitting}
          type="submit"
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
        <Card className="border bg-transparent p-4 sm:p-8">
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
                {renderTextField({
                  label: t('labels.date'),
                  isInvalid: !!errors.date,
                  errorMessage: errors.date?.message,
                  inputProps: {
                    'aria-label': t('a11y.date_label'),
                    ...register('date'),
                    type: 'date'
                  }
                })}
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
            {renderBankingInformation()}
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
