'use client';

import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Chip } from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';

type Props = {
  invoice: InvoiceBody;
  isSigned: boolean;
};

export default function InvoiceSigningHeader({ invoice, isSigned }: Props) {
  const t = useTranslations('invoice_signing');

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-default-500 text-sm">{t('eyebrow')}</p>
          <h1 className="text-2xl font-semibold">
            {t('title')}{' '}
            <span className="text-secondary">{invoice.sender.name}</span>
          </h1>
        </div>
        {isSigned && (
          <Chip
            color="success"
            variant="flat"
            startContent={<CheckCircleIcon className="ml-0.5 h-4 w-4" />}
          >
            {t('signed_status')}
          </Chip>
        )}
      </div>
      <p className="text-default-600 max-w-3xl text-sm">
        {t('subtitle', { invoiceId: invoice.invoiceId || '' })}
      </p>
    </section>
  );
}
