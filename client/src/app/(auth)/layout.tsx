import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-[calc(100dvh-64px)] shrink-0 flex-col px-6 py-8 md:py-12">
      {children}
    </main>
  );
}
