import { Chip } from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';

type Props = {
  invoice: InvoiceBody;
  isAcknowledged: boolean;
};

export default function InvoiceSigningHeader({
  invoice,
  isAcknowledged
}: Props) {
  const t = useTranslations('invoice_signing');

  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">
          {t('title')}{' '}
          <span className="text-secondary">{invoice.sender.name}</span>
        </h1>
        {isAcknowledged && (
          <Chip color="success" variant="soft">
            {t('signed_invoice_title')}
          </Chip>
        )}
      </div>
      <p className="text-muted max-w-3xl text-sm">
        {t(isAcknowledged ? 'subtitle_acknowledged' : 'subtitle', {
          invoiceId: invoice.invoiceId || ''
        })}
      </p>
    </section>
  );
}
