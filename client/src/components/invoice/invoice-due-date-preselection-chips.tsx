'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { Chip } from '@heroui/react';

const DUE_DATE_PRESELECTIONS = [
  { label: 'seven_days', value: '7' },
  { label: 'fourteen_days', value: '14' },
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
    <div className="mb-2 flex flex-wrap justify-start gap-1.5 sm:absolute sm:-top-7 sm:right-0 sm:mb-0 sm:justify-end sm:gap-1">
      {DUE_DATE_PRESELECTIONS.map(({ label, value }) => (
        <Chip
          key={value}
          color={currentlyActiveChip === value ? 'accent' : 'default'}
          onClick={() => handleDueDatePreselectionChange(value)}
          className="min-h-8 cursor-pointer text-sm sm:min-h-0 sm:text-xs"
        >
          {t(label)}
        </Chip>
      ))}
    </div>
  );
}
