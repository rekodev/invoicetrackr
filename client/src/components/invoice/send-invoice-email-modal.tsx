'use client';

import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Alert, Button, Checkbox, FieldError, Input, Label, Modal, TextArea, TextField, toast } from '@heroui/react';
import { getInvoiceEmailDefaults, invoiceEmailToday, switchInvoiceEmailLanguage } from '@invoicetrackr/emails/content';
import type { InvoiceBody, InvoiceEmailContent, InvoiceEmailDelivery, SendInvoiceEmailBody } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { recoverInvoiceEmailAction, sendInvoiceEmailAction } from '@/lib/actions/invoice';

type Props = {
  onClose: () => void;
  userId: number;
  invoice: InvoiceBody;
  isEmailVerified: boolean;
  kind: 'invoice' | 'reminder';
  outstandingAmount: string;
  recipientEmail?: string;
  delivery?: InvoiceEmailDelivery;
};

export default function SendInvoiceEmailModal({ onClose, userId, invoice, isEmailVerified,
  kind, outstandingAmount, recipientEmail, delivery }: Props) {
  const t = useTranslations('components.send_invoice_email');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const defaults = (language: 'lt' | 'en') => getInvoiceEmailDefaults({ language, kind,
    invoiceNumber: invoice.invoiceId || '', totalAmount: invoice.totalAmount, outstandingAmount,
    currency: invoice.currency || 'eur', dueDate: invoice.dueDate, today: invoiceEmailToday() });
  const initialLanguage = invoice.documentLanguage === 'en' ? 'en' : 'lt';
  const { control, handleSubmit, getValues, setValue, setError, watch, formState: { errors } } = useForm<InvoiceEmailContent>({
    defaultValues: delivery?.content || {
      recipientEmail: delivery?.recipient || recipientEmail || invoice.receiver.email || '',
      language: initialLanguage, kind, ...defaults(initialLanguage), includePublicLink: true,
      requestSignature: kind === 'invoice' && Boolean(invoice.recipientSigningRequestedAt && !invoice.recipientSignedAt)
    }
  });
  // eslint-disable-next-line react-hooks/incompatible-library
  const language = watch('language');
  const includePublicLink = watch('includePublicLink');
  const [result, setResult] = useState(delivery);
  const [transportUnknown, setTransportUnknown] = useState(false);
  const [confirmedDuplicate, setConfirmedDuplicate] = useState(false);
  const requestRef = useRef<SendInvoiceEmailBody | null>(null);
  const unresolved = result && ['queued', 'unknown'].includes(result.status)
    && !['superseded-unknown', 'reminder-no-longer-payable'].includes(result.failureCode || '');
  const expired = Boolean(result?.failureCode === 'superseded-unknown' || (unresolved && result?.recoveryExpiresAt && new Date(result.recoveryExpiresAt).getTime() <= Date.now()));
  const recovering = (Boolean(unresolved) && !expired) || transportUnknown;
  const frozen = isPending || recovering || (expired && !confirmedDuplicate);

  const changeLanguage = (next: 'lt' | 'en') => {
    const current = getValues();
    const updated = switchInvoiceEmailLanguage(current, defaults(current.language), defaults(next));
    setValue('language', next);
    setValue('subject', updated.subject);
    setValue('message', updated.message);
  };

  const submit = (content: InvoiceEmailContent) => startTransition(async () => {
    if (!isEmailVerified || (expired && !confirmedDuplicate)) return;
    let response: Awaited<ReturnType<typeof sendInvoiceEmailAction>>;
    try {
      if (recovering && result && !requestRef.current) {
        response = await recoverInvoiceEmailAction(userId, Number(invoice.id), result.id);
      } else {
        if (!requestRef.current) requestRef.current = { ...content, attemptKey: crypto.randomUUID(),
          confirmPossibleDuplicate: expired && confirmedDuplicate,
          replacesDeliveryId: expired ? result?.id : undefined };
        response = await sendInvoiceEmailAction(userId, Number(invoice.id), requestRef.current);
      }
    } catch {
      setTransportUnknown(true);
      toast(t('unknown_result'), { variant: 'warning' });
      router.refresh();
      return;
    }
    if (!response.ok) {
      setTransportUnknown(response.transportUnknown);
      if (!response.transportUnknown) requestRef.current = null;
      Object.entries(response.validationErrors).forEach(([key, message]) => {
        setError(key as keyof InvoiceEmailContent, { message });
      });
      toast(response.message, { variant: 'danger' });
      router.refresh();
      return;
    }
    setTransportUnknown(false);
    setResult(response.delivery);
    const accepted = ['sent', 'delivered'].includes(response.delivery.status);
    const failed = ['failed', 'bounced'].includes(response.delivery.status);
    toast(response.message, { variant: accepted ? 'success' : failed ? 'danger' : 'warning' });
    if (failed) requestRef.current = null;
    router.refresh();
    if (accepted) onClose();
  });

  return (
    <Modal.Backdrop isOpen onOpenChange={(open) => { if (!open && !isPending) onClose(); }}>
      <Modal.Container size="lg" scroll="outside">
        <Modal.Dialog>
          {!isPending ? <Modal.CloseTrigger /> : null}
          <form onSubmit={handleSubmit(submit)}>
            <Modal.Header>
              <Modal.Heading>{kind === 'reminder' ? t('reminder_title') : t('invoice_title')} · {invoice.invoiceId}</Modal.Heading>
              <p className="text-muted text-sm">{invoice.receiver.name}</p>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              {!isEmailVerified ? <Alert status="warning"><Alert.Indicator /><Alert.Content>
                <Alert.Description>{t('email_verification_required')}</Alert.Description>
              </Alert.Content></Alert> : null}
              {recovering ? <Alert status="warning"><Alert.Indicator /><Alert.Content>
                <Alert.Description>{t('unknown_result')}</Alert.Description>
              </Alert.Content></Alert> : null}
              {expired ? <Alert status="warning"><Alert.Indicator /><Alert.Content>
                <Alert.Description>{t('expired_result')}</Alert.Description>
              </Alert.Content></Alert> : null}
              {result?.status === 'failed' ? <p role="alert" className="text-muted text-sm">
                {result.failureCode === 'preparation-failed' ? t('preparation_failed') : t('provider_failed')}
              </p> : null}
              {result?.failureCode === 'reminder-no-longer-payable' ? <p role="status" className="text-muted text-sm">
                {t('reminder_paid')}
              </p> : null}
              <div role="group" aria-label={t('language')} className="flex items-center gap-2">
                <span className="text-sm">{t('language')}</span>
                {(['lt', 'en'] as const).map((value) => <Button key={value} size="sm" type="button"
                  variant={value === language ? 'primary' : 'secondary'} aria-pressed={value === language}
                  isDisabled={frozen} onPress={() => changeLanguage(value)}>
                  {value === 'lt' ? 'Lietuvių' : 'English'}
                </Button>)}
              </div>
              <Controller control={control} name="recipientEmail" render={({ field }) => (
                <TextField variant="secondary" isDisabled={frozen} isInvalid={!!errors.recipientEmail}>
                  <Label>{t('recipient_email')}</Label>
                  <Input {...field} type="email" autoComplete="email" required />
                  <FieldError>{errors.recipientEmail?.message}</FieldError>
                </TextField>
              )} />
              <Controller control={control} name="subject" render={({ field }) => (
                <TextField variant="secondary" isDisabled={frozen} isInvalid={!!errors.subject}>
                  <Label>{t('subject_label')}</Label>
                  <Input {...field} required maxLength={255} />
                  <FieldError>{errors.subject?.message}</FieldError>
                </TextField>
              )} />
              <Controller control={control} name="message" render={({ field }) => (
                <TextField variant="secondary" isDisabled={frozen} isInvalid={!!errors.message}>
                  <Label>{t('message_label')}</Label>
                  <TextArea {...field} maxLength={1000} rows={5} />
                  <FieldError>{errors.message?.message}</FieldError>
                </TextField>
              )} />
              <Button type="button" variant="tertiary" size="sm" isDisabled={frozen} onPress={() => {
                const next = defaults(language); setValue('subject', next.subject); setValue('message', next.message);
              }}>{t('reset_template')}</Button>
              <p className="text-muted text-sm">{t('attachment', { filename: `${invoice.invoiceId}.pdf` })}</p>
              <Controller control={control} name="includePublicLink" render={({ field }) => (
                <Checkbox isSelected={field.value} isDisabled={frozen} onChange={(selected) => {
                  field.onChange(selected); if (!selected) setValue('requestSignature', false);
                }}>
                  <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                  <Checkbox.Content><Label>{t('include_public_link')}</Label></Checkbox.Content>
                </Checkbox>
              )} />
              {kind === 'invoice' ? <Controller control={control} name="requestSignature" render={({ field }) => (
                <Checkbox isSelected={field.value} isDisabled={frozen || !includePublicLink} onChange={field.onChange}>
                  <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                  <Checkbox.Content><Label>{t('request_signature')}</Label></Checkbox.Content>
                </Checkbox>
              )} /> : null}
              {expired ? <Checkbox isSelected={confirmedDuplicate} isDisabled={isPending} onChange={(selected) => {
                setConfirmedDuplicate(selected);
                requestRef.current = null;
              }}>
                <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
                <Checkbox.Content><Label>{t('confirm_duplicate')}</Label></Checkbox.Content>
              </Checkbox> : null}
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" variant="tertiary" isDisabled={isPending} onPress={onClose}>{t('cancel')}</Button>
              <Button type="submit" isPending={isPending} isDisabled={!isEmailVerified || isPending
                || (expired && !confirmedDuplicate) || (kind === 'reminder' && Number(outstandingAmount) <= 0 && !recovering)}>
                <PaperAirplaneIcon className="size-4" />
                {recovering ? t('recover') : expired ? t('send_again') : t('send')}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
