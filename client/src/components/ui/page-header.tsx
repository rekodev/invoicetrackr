import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: ReactNode;
  titleAddon?: ReactNode;
  children?: ReactNode;
};

export default function PageHeader({
  title,
  description,
  titleAddon,
  children
}: Props) {
  return (
    <div className="gap-field-content flex flex-col">
      <header
        className={cn(
          'gap-x-field gap-y-heading flex flex-wrap items-center justify-between',
          children && 'min-h-page-heading'
        )}
      >
        <div className="gap-actions flex min-w-0 flex-wrap items-center">
          <h1 className="break-words text-lg font-semibold">{title}</h1>
          {titleAddon}
        </div>
        {children && (
          <div className="min-h-page-heading gap-actions flex min-w-0 flex-wrap items-center">
            {children}
          </div>
        )}
      </header>
      {description && <div className="text-muted text-sm">{description}</div>}
    </div>
  );
}
