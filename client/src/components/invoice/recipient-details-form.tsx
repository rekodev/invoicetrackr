'use client';

import { PencilSquareIcon } from '@heroicons/react/16/solid';
import {
  Accordion,
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
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { submitRecipientDetails } from '@/api/invoice';
import { isResponseError } from '@/lib/utils/error';

import SignaturePad from '../signature-pad';

type Props = {
  token: string;
  senderName: string;
  initialValues: InvoiceBody['receiver'];
};

export default function RecipientDetailsForm({
  token,
  senderName,
  initialValues
}: Props) {
  const t = useTranslations('recipient_details');
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [signature, setSignature] = useState<File | string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canSubmit = Boolean(
    values.name.trim() && values.businessNumber.trim() && values.address.trim()
  );

  const set = (name: keyof InvoiceBody['receiver'], value: string) =>
    setValues((current) => ({ ...current, [name]: value }));

  const save = async () => {
    setIsSubmitting(true);
    const response = await submitRecipientDetails(token, values, signature);
    setIsSubmitting(false);
    toast(response.data.message, {
      variant: isResponseError(response) ? 'danger' : 'success'
    });
    if (!isResponseError(response))
      router.push(`/invoices/public/${response.data.publicInvoiceToken}`);
  };

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
        {t('draft_from', { sender: senderName })}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{t('title')}</h1>
      <p className="text-muted mt-2 text-sm">{t('description')}</p>
      <div className="mt-6 flex flex-col gap-4">
        <RadioGroup
          aria-label={t('business_type')}
          orientation="horizontal"
          variant="secondary"
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
        <Accordion className="w-full overflow-hidden rounded-xl border">
          <Accordion.Item key="signature" id="signature">
            <Accordion.Heading>
              <Accordion.Trigger className="flex w-full items-center gap-2 px-4 py-3 text-left">
                <PencilSquareIcon
                  aria-hidden="true"
                  className="text-muted h-4 w-4"
                />
                <span className="flex-1 text-sm font-medium">
                  {t('signature_title')}
                </span>
                <Accordion.Indicator />
              </Accordion.Trigger>
            </Accordion.Heading>
            <Accordion.Panel>
              <Accordion.Body className="flex flex-col gap-3 px-4 pb-5">
                <p className="text-muted text-xs">
                  {t('signature_description')}
                </p>
                <SignaturePad
                  signature={signature}
                  onSignatureChange={setSignature}
                  isChipVisible={false}
                />
              </Accordion.Body>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <div className="flex justify-end">
          <Button
            isDisabled={!canSubmit}
            isPending={isSubmitting}
            onPress={save}
          >
            {t('submit')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
