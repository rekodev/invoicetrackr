'use client';

import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { Button, Popover } from '@heroui/react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  placement?: 'bottom start' | 'bottom end';
  action?: ReactNode;
};

export default function InfoPopover({
  title,
  children,
  placement = 'bottom start',
  action
}: Props) {
  return (
    <Popover>
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label={title}
        className="text-muted hover:text-foreground -my-2"
      >
        <InformationCircleIcon className="size-4" />
      </Button>
      <Popover.Content
        placement={placement}
        className="w-[calc(100vw-2rem)] max-w-md"
      >
        <Popover.Dialog className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <Popover.Heading className="font-medium">{title}</Popover.Heading>
            {action}
          </div>
          {children}
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
