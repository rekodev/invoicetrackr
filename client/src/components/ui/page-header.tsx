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
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="break-words text-lg font-semibold">{title}</h1>
          {titleAddon}
        </div>
        {description && <div className="text-muted mt-1 text-sm">{description}</div>}
      </div>
      {children}
    </header>
  );
}
