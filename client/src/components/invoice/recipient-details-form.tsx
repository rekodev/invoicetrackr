'use client';

import {
  Button,
  Card,
  FieldError,
  Input,
  Label,
  Radio,
  RadioGroup,
  TextField,
  toast
} from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { submitRecipientDetails } from '@/api/invoice';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  token: string;
  senderName: string;
  invoiceLabel: string;
  initialValues: InvoiceBody['receiver'];
};

export default function RecipientDetailsForm({
  token,
  senderName,
  invoiceLabel,
  initialValues
}: Props) {
  const t = useTranslations('recipient_details');
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const canSubmit = Boolean(
    values.name.trim() && values.businessNumber.trim() && values.address.trim()
  );

  const set = (name: keyof InvoiceBody['receiver'], value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const save = async () => {
    setIsSubmitting(true);
    const response = await submitRecipientDetails(token, values);
    setIsSubmitting(false);
    toast(response.data.message, {
      variant: isResponseError(response) ? 'danger' : 'success'
    });
    if (!isResponseError(response)) setSubmitted(true);
  };

  if (submitted)
    return (
      <Card className="mx-auto max-w-xl border p-8">
        <h1 className="text-2xl font-semibold">{t('submitted_title')}</h1>
        <p className="text-muted mt-2">
          {t('submitted_description', { sender: senderName })}
        </p>
      </Card>
    );

  const fields = [
    'name',
    'businessNumber',
    'vatNumber',
    'address',
    'email'
  ] as const;

  return (
    <Card className="mx-auto max-w-xl border p-6 sm:p-8">
      <p className="text-muted text-sm">
        {t('draft_from', { invoice: invoiceLabel, sender: senderName })}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{t('title')}</h1>
      <p className="text-muted mt-2 text-sm">{t('description')}</p>
      <div className="mt-6 flex flex-col gap-4">
        <RadioGroup
          aria-label={t('business_type')}
          orientation="horizontal"
          value={values.businessType}
          onChange={(value) => set('businessType', value)}
        >
          <Radio value="business">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>{t('business')}</Label>
            </Radio.Content>
          </Radio>
          <Radio value="individual">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label>{t('individual')}</Label>
            </Radio.Content>
          </Radio>
        </RadioGroup>
        {fields.map((name) => (
          <TextField key={name} variant="secondary">
            <Label>
              {name === 'businessNumber'
                ? t(
                    values.businessType === 'business'
                      ? 'company_number'
                      : 'activity_number'
                  )
                : t(`fields.${name}`)}
            </Label>
            <Input
              type={name === 'email' ? 'email' : 'text'}
              value={values[name] || ''}
              onChange={(event) => set(name, event.target.value)}
            />
            <FieldError />
          </TextField>
        ))}
        <Button isDisabled={!canSubmit} isPending={isSubmitting} onPress={save}>
          {t('submit')}
        </Button>
      </div>
    </Card>
  );
}
