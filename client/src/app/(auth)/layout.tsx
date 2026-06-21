import { ReactNode } from 'react';
import UserAmbientBackground from '../(user)/user-ambient-background';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex h-[calc(100dvh-64px)] flex-col">
      <UserAmbientBackground />
      {children}
    </main>
  );
}
