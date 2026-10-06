'use client';

import {
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  Select,
  TextArea,
  TextField,
  toast
} from '@heroui/react';
import {
  type ExpenseBody,
  type ExpenseInput,
  SUPPORTED_CURRENCIES
} from '@invoicetrackr/types';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { type HTMLAttributes, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';

import FileDropzone from '@/components/ui/file-dropzone';
import {
  addExpenseAction,
  updateExpenseAction,
  uploadExpenseAttachmentAction
} from '@/lib/actions/expense';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_PAYMENT_METHODS
} from '@/lib/constants/expense';
import { EXPENSE_WORKSPACE_PAGE } from '@/lib/constants/pages';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (_expense: ExpenseBody) => void;
  returnTo?: string;
  mode?: 'add' | 'edit';
  expenseData?: ExpenseBody;
};

type ExpenseFormData = Omit<
  ExpenseInput,
  | 'id'
  | 'deductibleAmount'
  | 'attachmentCount'
  | 'deletedAt'
  | 'createdAt'
  | 'updatedAt'
>;

const today = new Date().toISOString().slice(0, 10);

const INITIAL_EXPENSE_DATA: ExpenseFormData = {
  expenseDate: today,
  paymentDate: '',
  supplier: '',
  documentNumber: '',
  description: '',
  category: 'software',
  currency: 'eur',
  totalAmount: '',
  vatAmount: '',
  businessUsePercentage: 100,
  paymentMethod: 'bank_transfer',
  notes: ''
};

const getInitialExpenseData = (expenseData?: ExpenseBody): ExpenseFormData => ({
  ...INITIAL_EXPENSE_DATA,
  ...expenseData,
  paymentDate: expenseData?.paymentDate ?? '',
  documentNumber: expenseData?.documentNumber ?? '',
  vatAmount: expenseData?.vatAmount ?? '',
  notes: expenseData?.notes ?? ''
});

const formatMoney = (amount: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);

const ExpenseFormDialog = ({
  userId,
  isOpen,
  onClose,
  onSaved,
  returnTo,
  mode = 'add',
  expenseData
}: Props) => {
  const t = useTranslations('expenses.form_dialog');
  const tCategories = useTranslations('expenses.categories');
  const tPaymentMethods = useTranslations('expenses.payment_methods');
  const locale = useLocale();
  const isEditMode = mode === 'edit';
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [savedCreation, setSavedCreation] = useState<ExpenseBody | null>(null);
  const [submitError, setSubmitError] = useState('');
  const busy = useRef(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    reset
  } = useForm<ExpenseFormData>({
    defaultValues: getInitialExpenseData(expenseData)
  });

  const totalAmount = useWatch({ control, name: 'totalAmount' });
  const businessUsePercentage = useWatch({
    control,
    name: 'businessUsePercentage'
  });
  const handleClose = () => {
    if (busy.current) return;
    setSelectedFile(null);
    setSavedCreation(null);
    setSubmitError('');
    onClose();
  };
  const deductiblePreview = useMemo(() => {
    const total = Number(totalAmount || 0);
    const percentage = Number(businessUsePercentage || 0);

    if (Number.isNaN(total) || Number.isNaN(percentage)) return 0;

    return Math.max(0, (total * percentage) / 100);
  }, [businessUsePercentage, totalAmount]);

  useEffect(() => {
    if (!isOpen) return;
    if (isEditMode && !expenseData) return;

    reset(getInitialExpenseData(expenseData));
    setSavedCreation(null);
    setSelectedFile(null);
    setSubmitError('');
  }, [expenseData, isEditMode, isOpen, reset]);

  const onSubmit: SubmitHandler<ExpenseFormData> = async (data) => {
    if (busy.current) return;
    busy.current = true;
    setSubmitError('');
    try {
      const input = {
        ...data,
        // The server derives EUR amounts from the editable total.
        eurAmount: data.currency === 'eur' ? undefined : data.eurAmount || undefined
      };
      const response = savedCreation
        ? { ok: true, message: '', data: savedCreation, validationErrors: undefined }
        : isEditMode && expenseData?.id
          ? await updateExpenseAction({ userId, expenseId: expenseData.id, expenseData: input })
          : await addExpenseAction({ userId, expenseData: input });

      if (!response.ok) {
        if (response.validationErrors) Object.entries(response.validationErrors).forEach(([key, message]) => {
          setError(key as keyof ExpenseFormData, { message });
        });
        setSubmitError(response.message);
        return;
      }
      const savedExpense = response.data;
      if (!savedExpense?.id) return;
      // Remember creation before attempting the independent upload, so retry only uploads.
      if (!isEditMode) setSavedCreation(savedExpense);
      if (!isEditMode && selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploaded = await uploadExpenseAttachmentAction({ userId, expenseId: savedExpense.id, formData });
        if (!uploaded.ok) {
          setSubmitError(uploaded.message);
          return;
        }
      }
      toast(response.message || t('saved'), { variant: 'success' });
      onSaved?.(savedExpense);
      setSelectedFile(null);
      setSavedCreation(null);
      onClose();
    } catch {
      setSubmitError(t('save_failed'));
    } finally {
      busy.current = false;
    }
  };

  const renderTextField = ({
    name,
    label,
    type = 'text',
    inputMode,
    placeholder
  }: {
    name: keyof ExpenseFormData;
    label: string;
    type?: string;
    inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
    placeholder?: string;
  }) => {
    const error = errors[name];

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TextField variant="secondary" isDisabled={isSubmitting || Boolean(savedCreation)} isInvalid={Boolean(error)}>
            <Label>{label}</Label>
            <Input
              name={field.name}
              value={String(field.value ?? '')}
              type={type}
              inputMode={inputMode}
              placeholder={placeholder}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
            {error?.message ? <FieldError>{error.message}</FieldError> : null}
          </TextField>
        )}
      />
    );
  };

  if (isEditMode && !expenseData) return null;

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
      onOpenChange={(open) => !open && handleClose()}
    >
      <Modal.Container scroll="outside" size="lg">
        <Modal.Dialog>
          {!isSubmitting ? <Modal.CloseTrigger /> : null}
          <Modal.Header>
            <div>
              <Modal.Heading>
                {isEditMode ? t('title_edit') : t('title_add')}
              </Modal.Heading>
              <p className="text-muted mt-1 text-sm">{t('description')}</p>
            </div>
          </Modal.Header>
          <Modal.Body>
            {savedCreation?.id ? <div className="space-y-2 text-sm">
              <p>{t('created_upload_pending')}</p>
              <Link className="underline" href={`${EXPENSE_WORKSPACE_PAGE(savedCreation.id)}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}>{t('open_saved')}</Link>
            </div> : null}
            <form
              id="expense-form"
              noValidate
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              onSubmit={handleSubmit(onSubmit)}
            >
              {!isEditMode ? <fieldset disabled={isSubmitting} className="sm:col-span-2"><FileDropzone
                className="sm:col-span-2"
                label={t('fields.attachment')}
                title={t('upload.dropzone_title')}
                hint={t('upload.hint')}
                actionLabel={t('upload.select_file')}
                selectedFile={selectedFile}
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onFileChange={(file) => { if (!busy.current) setSelectedFile(file); }}
              /></fieldset> : null}
              {renderTextField({
                name: 'expenseDate',
                label: t('fields.expense_date'),
                type: 'date'
              })}
              {renderTextField({
                name: 'paymentDate',
                label: t('fields.payment_date'),
                type: 'date'
              })}
              <div className="sm:col-span-2">
                {renderTextField({
                  name: 'supplier',
                  label: t('fields.supplier'),
                  placeholder: t('placeholders.supplier')
                })}
              </div>
              {renderTextField({
                name: 'documentNumber',
                label: t('fields.document_number'),
                placeholder: t('placeholders.document_number')
              })}
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select
                    variant="secondary"
                    isDisabled={isSubmitting || Boolean(savedCreation)}
                    value={field.value}
                    onChange={field.onChange}
                    isInvalid={Boolean(errors.category)}
                  >
                    <Label>{t('fields.category')}</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {EXPENSE_CATEGORIES.map((category) => (
                          <ListBoxItem
                            key={category}
                            id={category}
                            textValue={tCategories(category)}
                          >
                            {tCategories(category)}
                            <ListBoxItem.Indicator />
                          </ListBoxItem>
                        ))}
                      </ListBox>
                    </Select.Popover>
                    <FieldError>{errors.category?.message}</FieldError>
                  </Select>
                )}
              />
              <div className="sm:col-span-2">
                {renderTextField({
                  name: 'description',
                  label: t('fields.description'),
                  placeholder: t('placeholders.description')
                })}
              </div>
              {renderTextField({
                name: 'totalAmount',
                label: t('fields.total_amount'),
                inputMode: 'decimal',
                placeholder: '0.00'
              })}
              {renderTextField({
                name: 'vatAmount',
                label: t('fields.vat_amount'),
                inputMode: 'decimal',
                placeholder: '0.00'
              })}
              {renderTextField({
                name: 'businessUsePercentage',
                label: t('fields.business_use_percentage'),
                inputMode: 'decimal'
              })}
              <TextField variant="secondary">
                <Label>{t('fields.deductible_amount')}</Label>
                <Input
                  value={formatMoney(deductiblePreview, locale)}
                  readOnly
                />
              </TextField>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <Select
                    variant="secondary"
                    isDisabled={isSubmitting || Boolean(savedCreation)}
                    value={field.value ?? 'bank_transfer'}
                    onChange={field.onChange}
                    isInvalid={Boolean(errors.paymentMethod)}
                  >
                    <Label>{t('fields.payment_method')}</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {EXPENSE_PAYMENT_METHODS.map((paymentMethod) => (
                          <ListBoxItem
                            key={paymentMethod}
                            id={paymentMethod}
                            textValue={tPaymentMethods(paymentMethod)}
                          >
                            {tPaymentMethods(paymentMethod)}
                            <ListBoxItem.Indicator />
                          </ListBoxItem>
                        ))}
                      </ListBox>
                    </Select.Popover>
                    <FieldError>{errors.paymentMethod?.message}</FieldError>
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select
                    variant="secondary"
                    isDisabled={isSubmitting || Boolean(savedCreation)}
                    value={field.value}
                    onChange={field.onChange}
                    isInvalid={Boolean(errors.currency)}
                  >
                    <Label>{t('fields.currency')}</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <ListBoxItem key={currency} id={currency} textValue={currency.toUpperCase()}>
                            {currency.toUpperCase()}
                            <ListBoxItem.Indicator />
                          </ListBoxItem>
                        ))}
                      </ListBox>
                    </Select.Popover>
                    <FieldError>{errors.currency?.message}</FieldError>
                  </Select>
                )}
              />
              <Controller
                control={control}
                name="notes"
                render={({ field }) => (
                  <TextField
                    variant="secondary"
                    className="sm:col-span-2"
                    isDisabled={isSubmitting || Boolean(savedCreation)}
                    isInvalid={Boolean(errors.notes)}
                  >
                    <Label>{t('fields.notes')}</Label>
                    <TextArea
                      name={field.name}
                      value={String(field.value ?? '')}
                      rows={3}
                      placeholder={t('placeholders.notes')}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                    />
                    <FieldError>{errors.notes?.message}</FieldError>
                  </TextField>
                )}
              />
            </form>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex w-full flex-col gap-3">
              {submitError ? <p role="alert" className="text-danger text-sm">{submitError}</p> : null}
              <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  isDisabled={isSubmitting}
                  className="w-full sm:w-auto"
                  onPress={handleClose}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  form="expense-form"
                  isPending={isSubmitting}
                  isDisabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {savedCreation ? t('retry_upload') : isEditMode ? t('submit_edit') : t('submit_add')}
                </Button>
              </div>
            </div>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default ExpenseFormDialog;
