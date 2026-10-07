'use client';

import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Button, toast, Tooltip } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';

import SendInvoiceEmailModal from '@/components/invoice/send-invoice-email-modal';
import { useInvoiceWorkspaceLoader } from '@/lib/hooks/invoice/use-invoice-workspace-loader';
import { getReminderRecipient } from '@/lib/utils/invoice';

type Props = {
  userId: number;
  invoiceId: number;
  invoiceLabel: string;
  isEmailVerified: boolean;
};

export default function OverdueReminderButton({
  userId,
  invoiceId,
  invoiceLabel,
  isEmailVerified
}: Props) {
  const t = useTranslations('dashboard.overdue');
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, startLoading] = useTransition();
  const { data, load } = useInvoiceWorkspaceLoader({
    userId,
    invoiceId,
    fallbackError: t('load_failed')
  });

  const button = (
    <Button
      size="sm"
      variant="secondary"
      aria-label={t('send_reminder_label', { invoice: invoiceLabel })}
      isDisabled={!isEmailVerified || loading}
      isPending={loading}
      onPress={() =>
        startLoading(async () => {
          const fresh = await load();
          if (!fresh) {
            toast(t('load_failed'), { variant: 'danger' });
            return;
          }
          setIsOpen(true);
        })
      }
    >
      <PaperAirplaneIcon className="size-4" />
      {t('send_reminder')}
    </Button>
  );

  return (
    <>
      {isEmailVerified ? (
        button
      ) : (
        <Tooltip delay={0}>
          <Tooltip.Trigger>
            <span tabIndex={0}>{button}</span>
          </Tooltip.Trigger>
          <Tooltip.Content>{t('reminder_unavailable')}</Tooltip.Content>
        </Tooltip>
      )}
      {isOpen && data ? (
        <SendInvoiceEmailModal
          userId={userId}
          invoice={data.invoice}
          isEmailVerified={isEmailVerified}
          kind="reminder"
          outstandingAmount={data.balance.outstandingAmount}
          recipientEmail={getReminderRecipient(data.deliveries)}
          onClose={() => {
            setIsOpen(false);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
