import { Metadata } from 'next';

import ForgotPasswordForm from '@/components/auth/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot password',
  description: 'Reset your InvoiceTrackr account password.',
  alternates: { canonical: '/forgot-password' },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  }
};

export default function ForgotPasswordPage() {
  return (
    <section className="flex flex-1 items-center justify-center px-6 py-8">
      <ForgotPasswordForm />
    </section>
  );
}
