import { ReactNode } from 'react';
import UserAmbientBackground from '../(user)/user-ambient-background';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <UserAmbientBackground />
      {children}
    </>
  );
}
