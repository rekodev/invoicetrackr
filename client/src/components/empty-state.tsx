'use client';

import { buttonVariants, cn } from '@heroui/react';
import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  action,
  className
}: Props) {
  return (
    <div
      className={cn(
        'flex min-h-[280px] flex-col items-center justify-center gap-3 px-4 py-10 text-center',
        className
      )}
    >
      <div className="max-w-sm">
        <p className="text-muted text-sm font-medium">{title}</p>
        {description && (
          <p className="text-muted mt-1 text-sm">{description}</p>
        )}
      </div>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={buttonVariants({
            variant: 'secondary',
            size: 'sm',
            className: 'w-full justify-center sm:w-auto'
          })}
        >
          {actionLabel}
        </Link>
      ) : (
        action
      )}
    </div>
  );
}
