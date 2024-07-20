import type { Metadata } from 'next';
import { ReactNode } from 'react';

import Breadcrumbs from '@/components/Breadcrumbs';

import '../globals.css';

export const metadata: Metadata = {
  title: 'Invoice App',
  description: 'Invoice generating and tracking',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className='flex-grow flex flex-col max-w-5xl p-6 mx-auto w-full'>
      <Breadcrumbs />
      {children}
    </main>
  );
}
