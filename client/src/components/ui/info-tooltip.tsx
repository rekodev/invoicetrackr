'use client';

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Button, Tooltip } from '@heroui/react';

type Props = { label: string; text: string };

export default function InfoTooltip({ label, text }: Props) {
  return (
    <Tooltip delay={0}>
      <Button
        isIconOnly
        size="sm"
        variant="tertiary"
        type="button"
        aria-label={label}
        className="text-muted hover:text-foreground size-5 min-w-5 shrink-0 rounded-full p-0"
      >
        <InformationCircleIcon className="block size-4" />
      </Button>
      <Tooltip.Content className="max-w-xs">
        <p className="whitespace-normal break-normal">{text}</p>
      </Tooltip.Content>
    </Tooltip>
  );
}
