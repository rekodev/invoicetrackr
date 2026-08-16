'use client';

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '@heroui/react';

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
        <Tooltip.Trigger>
          <button
            type="button"
            aria-label={`${explanation} ${formula}`}
            className="text-muted hover:text-foreground inline-flex size-5 translate-y-px shrink-0 items-center justify-center rounded-full leading-none outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <InformationCircleIcon className="block size-4" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content className="max-w-sm">
          <div className="break-normal whitespace-normal [hyphens:none] [overflow-wrap:normal]">
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
