import { ReactNode } from 'react';
import UserAmbientBackground from '../(user)/user-ambient-background';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-[calc(100dvh-64px)] shrink-0 flex-col px-6 py-8">
      <UserAmbientBackground />
      {children}
    </main>
  );
}
