'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Chip } from '@heroui/react';

const DUE_DATE_PRESELECTIONS = [
  { label: 'seven_days', value: '7' },
  { label: 'fifteen_days', value: '15' },
  { label: 'thirty_days', value: '30' },
  { label: 'custom', value: 'custom' }
];

type Props = {
  dateDiffFromDueDate: number;
  onDueDatePreselectionChange?: (_dueDatePreselection: string) => void;
};

export default function InvoiceDueDatePreselectionChips({
  dateDiffFromDueDate,
  onDueDatePreselectionChange
}: Props) {
  const t = useTranslations(
    'components.invoice_form.due_date_preselection_chips'
  );
  const [currentlyActiveChip, setCurrentlyActiveChip] = useState<string>();

  const handleDueDatePreselectionChange = useCallback(
    (dueDatePreselection: string) => {
      setCurrentlyActiveChip(dueDatePreselection);
      onDueDatePreselectionChange?.(dueDatePreselection);
    },
    [onDueDatePreselectionChange]
  );

  useEffect(() => {
    const matchingPreselection = DUE_DATE_PRESELECTIONS.find(
      (preselection) => Number(preselection.value) === dateDiffFromDueDate
    );

    if (matchingPreselection) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentlyActiveChip(matchingPreselection.value);
    } else {
      setCurrentlyActiveChip('custom');
    }
  }, [dateDiffFromDueDate]);

  return (
    <div className="absolute -bottom-8 right-0 flex w-full justify-end gap-1 md:-top-8">
      {DUE_DATE_PRESELECTIONS.map(({ label, value }) => (
        <Chip
          key={value}
          size="sm"
          color={currentlyActiveChip === value ? 'secondary' : 'default'}
          onClick={() => handleDueDatePreselectionChange(value)}
          className="cursor-pointer"
        >
          {t(label)}
        </Chip>
      ))}
    </div>
  );
}
