import { cn } from '@heroui/react';

type Props = {
  className?: string;
  accentClassName?: string;
};

export default function AppWordmark({ className, accentClassName }: Props) {
  return (
    <p className={cn('font-bold tracking-normal', className)}>
      INVOICE
      <span
        className={cn('text-accent dark:text-secondary-600', accentClassName)}
      >
        TRACKR
      </span>
    </p>
  );
}
