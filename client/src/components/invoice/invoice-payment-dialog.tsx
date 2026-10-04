'use client';

import { Alert, Button, FieldError, Input, Label, Modal, TextArea, TextField, toast } from '@heroui/react';
import type { InvoicePayment, InvoicePaymentBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { saveInvoicePaymentAction } from '@/lib/actions/invoice';
import { todayInLithuania } from '@/lib/utils/date';

type Props = {
  userId: number;
  invoiceId: number;
  outstandingAmount: string;
  payment: InvoicePayment | null;
  onClose: () => void;
  onSaved: () => void;
  onRefresh: () => void;
};

export default function InvoicePaymentDialog({ userId, invoiceId, outstandingAmount, payment, onClose, onSaved, onRefresh }: Props) {
  const t = useTranslations('invoices.workspace');
  const [saveError, setSaveError] = useState('');
  const [outcomeUnknown, setOutcomeUnknown] = useState(false);
  const submitting = useRef(false);
  const close = () => outcomeUnknown ? onRefresh() : onClose();
  const today = todayInLithuania();
  const maximumAmount = ((Math.round(Number(outstandingAmount) * 100) + Math.round(Number(payment?.amount || 0) * 100)) / 100).toFixed(2);
  const { control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<InvoicePaymentBody>({
    defaultValues: {
      paymentDate: payment?.paymentDate || today,
      amount: payment?.amount || outstandingAmount,
      bankReference: payment?.bankReference || '',
      notes: payment?.notes || ''
    }
  });
  const fieldsDisabled = isSubmitting || outcomeUnknown;

  const save = async (values: InvoicePaymentBody) => {
    if (submitting.current || outcomeUnknown) return;
    submitting.current = true;
    setSaveError('');
    try {
      const response = await saveInvoicePaymentAction({ userId, invoiceId, paymentId: payment?.id, payment: values });
      if (!response.ok) {
        if (response.transportUnknown) {
          setOutcomeUnknown(true);
          setSaveError(t('save_failed'));
          return;
        }
        setSaveError(response.message);
        for (const [key, message] of Object.entries(response.validationErrors)) {
          if (key === 'amount' || key === 'paymentDate' || key === 'bankReference' || key === 'notes') {
            setError(key, { message });
          }
        }
        return;
      }
      toast(t('saved'), { variant: 'success' });
      onSaved();
    } catch {
      setOutcomeUnknown(true);
      setSaveError(t('save_failed'));
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Modal.Backdrop isOpen isDismissable={!isSubmitting} isKeyboardDismissDisabled={isSubmitting}
      onOpenChange={(open) => !open && !submitting.current && close()}>
      <Modal.Container>
        <Modal.Dialog>
          {!isSubmitting ? <Modal.CloseTrigger /> : null}
          <Modal.Header>
            <Modal.Heading>{payment ? t('edit_payment') : t('record_payment')}</Modal.Heading>
          </Modal.Header>
          <form noValidate onSubmit={handleSubmit(save)}>
            <Modal.Body className="space-y-3">
              <p className="text-muted text-sm">{t('bank_transfer')}</p>
              <Alert status="accent">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{t('payment_maximum', { maximum: maximumAmount })}</Alert.Title>
                </Alert.Content>
              </Alert>
              <Controller name="paymentDate" control={control} rules={{ required: t('date_required') }} render={({ field }) => (
                <TextField isRequired isDisabled={fieldsDisabled} isInvalid={!!errors.paymentDate}>
                  <Label>{t('payment_date')}</Label>
                  <Input {...field} variant="secondary" type="date" max={today} />
                  <FieldError>{errors.paymentDate?.message}</FieldError>
                </TextField>
              )} />
              <Controller name="amount" control={control} rules={{
                required: t('amount_invalid'),
                pattern: { value: /^\d{1,10}(?:\.\d{1,2})?$/, message: t('amount_invalid') },
                validate: (value) => Number(value) > 0 && Number(value) <= Number(maximumAmount) || t('amount_limit', { maximum: maximumAmount })
              }} render={({ field }) => (
                <TextField isRequired isDisabled={fieldsDisabled} isInvalid={!!errors.amount}>
                  <Label>{t('payment_amount')}</Label>
                  <Input {...field} variant="secondary" type="number" min="0.01" max={maximumAmount} step="0.01" />
                  <FieldError>{errors.amount?.message}</FieldError>
                </TextField>
              )} />
              <Controller name="bankReference" control={control} render={({ field }) => (
                <TextField isDisabled={fieldsDisabled} isInvalid={!!errors.bankReference}>
                  <Label>{t('payment_reference')}</Label>
                  <Input {...field} value={field.value || ''} variant="secondary" maxLength={255} />
                  <FieldError>{errors.bankReference?.message}</FieldError>
                </TextField>
              )} />
              <Controller name="notes" control={control} render={({ field }) => (
                <TextField isDisabled={fieldsDisabled} isInvalid={!!errors.notes}>
                  <Label>{t('payment_note')}</Label>
                  <TextArea {...field} value={field.value || ''} variant="secondary" maxLength={2000} rows={3} />
                  <FieldError>{errors.notes?.message}</FieldError>
                </TextField>
              )} />
              {saveError ? <p role="alert" className="text-danger text-sm">{saveError}</p> : null}
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" variant="tertiary" isDisabled={isSubmitting} onPress={close}>{t('close')}</Button>
              {outcomeUnknown ? (
                <Button type="button" onPress={onRefresh}>{t('refresh_workspace')}</Button>
              ) : (
                <Button type="submit" isPending={isSubmitting} isDisabled={isSubmitting}>{t('save_payment')}</Button>
              )}
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
