'use client';

import { ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { Button, toast } from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';

import { formatPlainAmount } from '@/lib/utils/currency';

type Props = { amount: string; label: string };

const CopyAmountButton = ({ amount, label }: Props) => {
  const t = useTranslations('reports.annual.figures');
  const locale = useLocale();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(formatPlainAmount(amount, locale));
      toast(t('copied'), { variant: 'success' });
    } catch {
      toast(t('copy_failed'), { variant: 'danger' });
    }
  };

  return (
    <Button
      isIconOnly
      size="sm"
      variant="ghost"
      aria-label={t('copy', { label })}
      className="text-muted hover:text-foreground -my-2"
      onPress={copy}
    >
      <ClipboardDocumentIcon aria-hidden="true" className="size-4" />
    </Button>
  );
};

export default CopyAmountButton;
