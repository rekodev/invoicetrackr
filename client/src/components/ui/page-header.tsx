import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export default function PageHeader({ title, description, children }: Props) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && <p className="text-muted mt-1 text-sm">{description}</p>}
      </div>
      {children}
    </header>
  );
}
