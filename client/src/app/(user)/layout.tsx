import type { Metadata } from 'next';
import { ReactNode } from 'react';
import '../globals.css';

import Breadcrumbs from '@/components/breadcrumbs';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  },
  referrer: 'no-referrer'
};

export default function UserLayout({
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
