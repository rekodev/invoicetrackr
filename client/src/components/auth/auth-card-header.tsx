'use client';

import { CardHeader } from '@heroui/react';
import type { ReactNode } from 'react';

import AppBrand from '@/components/app-brand';

type Props = {
  title: string;
  description: string;
  children?: ReactNode;
};

export default function AuthCardHeader({
  title,
  description,
  children
}: Props) {
  return (
    <CardHeader className="flex flex-col items-start gap-5 p-8 pb-0">
      <AppBrand className="gap-3" wordmarkClassName="text-sm" />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium tracking-tight">{title}</h1>
        <p className="text-muted text-sm leading-5">{description}</p>
      </div>

      {children}
    </CardHeader>
  );
}
