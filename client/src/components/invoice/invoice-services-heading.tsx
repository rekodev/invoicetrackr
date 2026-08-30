'use client';

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Button, Tooltip } from '@heroui/react';

type Props = {
  label: string;
  explanation: string;
  formula: string;
};

export default function InvoiceServicesHeading({
  label,
  explanation,
  formula
}: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <h4>{label}</h4>
      <Tooltip delay={0}>
        <Button
          isIconOnly
          size="sm"
          variant="tertiary"
          type="button"
          aria-label={`${explanation} ${formula}`}
          className="text-muted hover:text-foreground size-5 min-w-5 shrink-0 translate-y-px rounded-full p-0"
        >
          <InformationCircleIcon className="block size-4" />
        </Button>
        <Tooltip.Content className="max-w-sm">
          <div className="whitespace-normal break-normal [hyphens:none] [overflow-wrap:normal]">
            <p>{explanation}</p>
            <p className="text-muted border-default-200 mt-2 border-t pt-2 text-xs">
              {formula}
            </p>
          </div>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}
