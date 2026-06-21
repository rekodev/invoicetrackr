import type { Metadata } from 'next';

import CreateNewPasswordForm from '@/components/auth/create-new-password-form';
import InvalidTokenCard from '@/components/auth/invalid-token-card';
import { getUserResetPasswordToken } from '@/api/user';
import { isResponseError } from '@/lib/utils/error';

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
  const { token } = await params;

  const response = await getUserResetPasswordToken(token);

  if (isResponseError(response)) {
    return (
      <section className="flex flex-1 items-center justify-center px-6 py-8">
        <InvalidTokenCard />
      </section>
    );
  }

  return (
    <section className="flex flex-1 items-center justify-center px-6 py-8">
      <CreateNewPasswordForm userId={response.data.userId} token={token} />
    </section>
  );
}
