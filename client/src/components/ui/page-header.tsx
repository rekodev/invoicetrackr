import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
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
          <h1 className="text-xl font-semibold">{title}</h1>
          {titleAddon}
        </div>
        {description && <p className="text-muted mt-1 text-sm">{description}</p>}
      </div>
      {children}
    </header>
  );
}
