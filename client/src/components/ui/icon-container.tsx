import { cn } from '@heroui/react';
import type { ReactNode } from 'react';

type IconContainerVariant =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'secondary'
  | 'accent';

type IconContainerSize = 'sm' | 'md' | 'lg';

type Props = {
  children: ReactNode;
  className?: string;
  size?: IconContainerSize;
  variant?: IconContainerVariant;
};

const sizeClasses: Record<IconContainerSize, string> = {
  sm: 'h-7 w-7 rounded-lg',
  md: 'h-9 w-9 rounded-xl',
  lg: 'h-11 w-11 rounded-xl'
};

const variantClasses: Record<IconContainerVariant, string> = {
  neutral: 'text-muted bg-default-foreground/5 border-muted/15',
  success: 'text-success bg-success/10 border-success/20',
  warning: 'text-warning bg-warning/10 border-warning/20',
  danger: 'text-danger bg-danger/10 border-danger/20',
  secondary: 'text-secondary bg-secondary/10 border-secondary/20',
  accent: 'text-accent bg-accent/10 border-accent/20'
};

export default function IconContainer({
  children,
  className,
  size = 'md',
  variant = 'neutral'
}: Props) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center border',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
