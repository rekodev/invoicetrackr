import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '../globals.css';

import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'InvoiceTrackr',
  description: 'Invoice generating and tracking'
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-grow flex-col px-6">
      <Breadcrumbs />
      {children}
    </main>
  );
}
