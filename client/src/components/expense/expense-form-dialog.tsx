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
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import type { ExpenseBody, ExpenseInput } from '@invoicetrackr/types';
import { type HTMLAttributes, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  EXPENSE_CATEGORIES,
  EXPENSE_PAYMENT_METHODS
} from '@/lib/constants/expense';
import {
  addExpenseAction,
  updateExpenseAction,
  uploadExpenseAttachmentAction
} from '@/lib/actions/expense';
import FileDropzone from '@/components/ui/file-dropzone';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
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
  eurAmount: '',
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
  mode = 'add',
  expenseData
}: Props) => {
  const t = useTranslations('expenses.form_dialog');
  const tCategories = useTranslations('expenses.categories');
  const tPaymentMethods = useTranslations('expenses.payment_methods');
  const locale = useLocale();
  const isEditMode = mode === 'edit';
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    reset,
    watch
  } = useForm<ExpenseFormData>({
    defaultValues: getInitialExpenseData(expenseData)
  });

  const totalAmount = watch('totalAmount');
  const businessUsePercentage = watch('businessUsePercentage');
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
    setSelectedFile(null);
  }, [expenseData, isEditMode, isOpen, reset]);

  const onSubmit: SubmitHandler<ExpenseFormData> = async (data) => {
    const response =
      isEditMode && expenseData?.id
        ? await updateExpenseAction({
            userId,
            expenseId: expenseData.id,
            expenseData: data
          })
        : await addExpenseAction({ userId, expenseData: data });

    if (!response.ok) {
      if (response.validationErrors) {
        Object.entries(response.validationErrors).forEach(([key, message]) => {
          setError(key as keyof ExpenseFormData, { message });
        });
      }

      toast(response.message || '', { variant: 'danger' });
      return;
    }

    const savedExpense = response.data as ExpenseBody | undefined;
    const savedExpenseId = savedExpense?.id ?? expenseData?.id;

    if (selectedFile && savedExpenseId) {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadResponse = await uploadExpenseAttachmentAction({
        userId,
        expenseId: savedExpenseId,
        formData
      });

      if (!uploadResponse.ok) {
        toast(uploadResponse.message || '', { variant: 'danger' });
        return;
      }
    }

    toast(response.message || '', { variant: 'success' });
    onClose();
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
          <TextField variant="secondary" isInvalid={Boolean(error)}>
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
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <Modal.Container scroll="outside" size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <div>
                <Modal.Heading>
                  {isEditMode ? t('title_edit') : t('title_add')}
                </Modal.Heading>
                <p className="text-muted mt-1 text-sm">{t('description')}</p>
              </div>
            </Modal.Header>
            <Modal.Body>
              <form
                id="expense-form"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={handleSubmit(onSubmit)}
              >
                <FileDropzone
                  className="sm:col-span-2"
                  label={t('fields.attachment')}
                  title={t('upload.dropzone_title')}
                  hint={t('upload.hint')}
                  actionLabel={t('upload.select_file')}
                  selectedFile={selectedFile}
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onFileChange={setSelectedFile}
                />
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
                <TextField variant="secondary">
                  <Label>{t('fields.currency')}</Label>
                  <Input value={t('currency_fixed')} readOnly />
                </TextField>
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <TextField
                      variant="secondary"
                      className="sm:col-span-2"
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
              <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto"
                  onPress={onClose}
                >
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  form="expense-form"
                  isPending={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isEditMode ? t('submit_edit') : t('submit_add')}
                </Button>
              </div>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default ExpenseFormDialog;
