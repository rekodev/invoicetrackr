import {
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { Input, buttonVariants } from '@heroui/react';

export default function PreviewToolbar({
  search,
  primary,
  secondary,
  total,
  rowsPerPage
}: {
  search: string;
  primary: string;
  secondary?: string;
  total: string;
  rowsPerPage?: string;
}) {
  return (
    <div className="flex flex-col gap-4 pt-1">
      <div className="flex items-end justify-between gap-3">
        <div className="flex w-full items-center gap-2 sm:max-w-[44%]">
          <MagnifyingGlassIcon className="h-4 w-4" />
          <Input
            aria-label={search}
            className="w-full"
            placeholder={search}
            variant="secondary"
          />
        </div>
        <div className="flex shrink-0 gap-3">
          {secondary && (
            <span
              className={buttonVariants({
                variant: 'outline',
                className: 'hidden items-center gap-2 text-sm sm:inline-flex'
              })}
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              {secondary}
            </span>
          )}
          <span
            className={buttonVariants({
              className: 'inline-flex items-center gap-2 px-3 py-2 text-sm'
            })}
          >
            <PlusIcon className="h-4 w-4" />
            {primary}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="section-eyebrow text-muted">{total}</span>
        {rowsPerPage && (
          <span className="section-eyebrow text-muted">
            {rowsPerPage} 10
          </span>
        )}
      </div>
    </div>
  );
}
