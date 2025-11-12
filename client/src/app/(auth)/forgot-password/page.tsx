import { Metadata } from 'next';
import { useTranslations } from 'next-intl';

import AppLogo from '@/components/app-logo';
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
  const t = useTranslations('forgot_password');

  return (
    <section className="flex flex-col items-center justify-center gap-4 px-6 py-8">
      <AppLogo height={80} width={80} />
      <div className="mb-6 flex flex-col items-center justify-center gap-1 text-center">
        <h2 className="text-2xl font-medium">{t('title')}</h2>
        <p className="text-default-500">{t('description')}</p>
      </div>
      <ForgotPasswordForm />
    </section>
  );
}
