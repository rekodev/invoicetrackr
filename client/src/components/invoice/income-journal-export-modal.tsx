'use client';

import {
  Button,
  Input,
  Label,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextField,
  toast
} from '@heroui/react';
import { useLocale, useTranslations } from 'next-intl';
import { AppModal } from '@/components/ui/app-modal';
import { useState } from 'react';

import { getIncomeJournalExport } from '@/api/invoice';
import { isResponseError } from '@/lib/utils/error';

type Props = {
  userId: number;
  isOpen: boolean;
  onOpenChange: (_isOpen: boolean) => void;
};

const currentYear = new Date().getFullYear();

export default function IncomeJournalExportModal({
  userId,
  isOpen,
  onOpenChange
}: Props) {
  const t = useTranslations('invoices.income_journal');
  const locale = useLocale();
  const [from, setFrom] = useState(`${currentYear}-01-01`);
  const [to, setTo] = useState(`${currentYear}-12-31`);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const response = await getIncomeJournalExport({
      userId,
      from,
      to
    });
    setIsExporting(false);

    if (isResponseError(response)) {
      toast(response.data.message, { variant: 'danger' });
      return;
    }

    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download =
      locale === 'lt'
        ? `pajamu-zurnalas-${from}-${to}.csv`
        : `income-journal-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onOpenChange(false);
  };

  return (
    <AppModal isOpen={isOpen} onClose={() => onOpenChange(false)}>
      <>
        <ModalHeader>{t('title')}</ModalHeader>
        <ModalBody>
          <p className="text-default-500 text-sm">{t('description')}</p>
          <TextField>
            <Label>{t('from')}</Label>
            <Input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </TextField>
          <TextField>
            <Label>{t('to')}</Label>
            <Input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </TextField>
        </ModalBody>
        <ModalFooter>
          <Button variant="tertiary" onPress={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button
            isDisabled={!from || !to || from > to}
            onPress={handleExport}
            isPending={isExporting}
          >
            {t('export')}
          </Button>
        </ModalFooter>
      </>
    </AppModal>
  );
}
