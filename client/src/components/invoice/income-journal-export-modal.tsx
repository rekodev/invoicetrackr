'use client';

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast
} from '@heroui/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

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
  const [from, setFrom] = useState(`${currentYear}-01-01`);
  const [to, setTo] = useState(`${currentYear}-12-31`);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const response = await getIncomeJournalExport({ userId, from, to });
    setIsExporting(false);

    if (isResponseError(response)) {
      addToast({ title: response.data.message, color: 'danger' });
      return;
    }

    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pajamu-zurnalas-${from}-${to}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>{t('title')}</ModalHeader>
            <ModalBody>
              <p className="text-default-500 text-sm">{t('description')}</p>
              <Input
                type="date"
                label={t('from')}
                value={from}
                onValueChange={setFrom}
              />
              <Input
                type="date"
                label={t('to')}
                value={to}
                onValueChange={setTo}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                {t('cancel')}
              </Button>
              <Button
                color="secondary"
                isDisabled={!from || !to || from > to}
                isLoading={isExporting}
                onPress={handleExport}
              >
                {t('export')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
