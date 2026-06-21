import type { ReactNode } from 'react';
import { cn } from '@heroui/react';

import AppLogo from './app-logo';
import AppWordmark from './app-wordmark';

type Props = {
  className?: string;
  logoSize?: number;
  wordmarkClassName?: string;
  wordmarkAccentClassName?: string;
  children?: ReactNode;
};

export default function AppBrand({
  children,
  className,
  logoSize = 40,
  wordmarkClassName,
  wordmarkAccentClassName
}: Props) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <AppLogo height={logoSize} width={logoSize} />
      {children ? (
        <div className="flex flex-col">
          <AppWordmark
            className={wordmarkClassName}
            accentClassName={wordmarkAccentClassName}
          />
          {children}
        </div>
      ) : (
        <AppWordmark
          className={wordmarkClassName}
          accentClassName={wordmarkAccentClassName}
        />
      )}
    </div>
  );
}
