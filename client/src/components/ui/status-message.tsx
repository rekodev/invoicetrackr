import type { ComponentType, ReactNode, SVGProps } from 'react';

type Props = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone: 'danger' | 'warning';
  title: string;
  description: string;
  action: ReactNode;
};

const toneClasses = {
  danger: { background: 'bg-danger/10', icon: 'text-danger' },
  warning: { background: 'bg-warning/10', icon: 'text-warning' }
};

export default function StatusMessage({
  icon: Icon,
  tone,
  title,
  description,
  action
}: Props) {
  return (
    <div className="flex flex-1 items-center justify-center p-card">
      <div className="mx-auto flex max-w-md flex-col items-center gap-section text-center">
        <div
          className={`${toneClasses[tone].background} flex items-center justify-center rounded-full p-4`}
        >
          <Icon className={`${toneClasses[tone].icon} size-8`} />
        </div>

        <div className="space-y-field">
          <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted">{description}</p>
        </div>

        {action}
      </div>
    </div>
  );
}
