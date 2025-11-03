import { Metadata } from 'next';

import LoginForm from '@/components/auth/login-form';
import AppLogo from '@/components/icons/AppLogo';

export const metadata: Metadata = {
  title: 'Log In',
  description: 'Access your InvoiceTrackr account.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  },
  alternates: { canonical: '/login' }
};

export default function LogInPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 px-6 py-8">
      <AppLogo width={80} height={80} />
      <div className="mb-6 flex flex-col items-center justify-center gap-1">
        <h2 className="text-2xl font-medium">Welcome</h2>
        <p className="text-default-500">Log into your account to continue</p>
      </div>
      <LoginForm />
    </section>
  );
}
