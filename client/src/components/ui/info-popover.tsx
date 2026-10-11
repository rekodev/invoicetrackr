'use client';

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Button, Popover } from '@heroui/react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  placement?: 'bottom start' | 'bottom end';
};

export default function InfoPopover({
  title,
  children,
  placement = 'bottom start'
}: Props) {
  return (
    <Popover>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label={title}
        className="text-muted hover:text-foreground"
      >
        <InformationCircleIcon className="size-4" />
      </Button>
      <Popover.Content
        placement={placement}
        className="w-[calc(100vw-2rem)] max-w-md"
      >
        <Popover.Dialog className="flex flex-col gap-2 text-sm">
          <Popover.Heading className="font-medium">{title}</Popover.Heading>
          {children}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
