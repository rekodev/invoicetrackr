import { HttpStatusCode } from 'axios';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getUserResetPasswordToken } from '@/api';
import CreateNewPasswordForm from '@/components/auth/create-new-password-form';
import InvalidTokenCard from '@/components/auth/invalid-token-card';
import AppLogo from '@/components/icons/AppLogo';

export const metadata: Metadata = {
  title: 'Create new password',
  description: 'Set a new password for your InvoiceTrackr account.',
  alternates: { canonical: '/create-new-password' },
  referrer: 'no-referrer',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  }
};

type Props = {
  params: Promise<{ token: string }>;
};

export default async function CreateNewPasswordPage({ params }: Props) {
  const t = await getTranslations('create_new_password');
  const { token } = await params;

  const response = await getUserResetPasswordToken(token);

  if (response.status !== HttpStatusCode.Ok) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 px-6 py-8">
        <AppLogo height={80} width={80} />
        <div className="mb-6 flex flex-col items-center justify-center gap-1 text-center">
          <h2 className="text-2xl font-medium">{t('title')}</h2>
          <p className="text-default-500">{t('description')}</p>
        </div>
        <InvalidTokenCard />
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4 px-6 py-8">
      <AppLogo height={80} width={80} />
      <div className="mb-6 flex flex-col items-center justify-center gap-1 text-center">
        <h2 className="text-2xl font-medium">{t('title')}</h2>
        <p className="text-default-500">{t('description')}</p>
      </div>
      <CreateNewPasswordForm userId={response.data.userId} token={token} />
    </section>
  );
}
