import type { Metadata } from 'next';

import VerifyEmailResultCard from '@/components/auth/verify-email-result-card';
import { auth } from '@/auth';
import { isResponseError } from '@/lib/utils/error';
import { verifyEmailToken } from '@/api/user';

export const metadata: Metadata = {
  title: 'Verify email',
  description: 'Verify your InvoiceTrackr account email.',
  alternates: { canonical: '/verify-email' },
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

export default async function VerifyEmailPage({ params }: Props) {
  const { token } = await params;
  const response = await verifyEmailToken(token);

  if (isResponseError(response)) {
    return (
      <section className="flex flex-1 items-center justify-center px-6 py-8">
        <VerifyEmailResultCard status="error" message={response.data.message} />
      </section>
    );
  }

  const session = await auth();

  return (
    <section className="flex flex-1 items-center justify-center px-6 py-8">
      <VerifyEmailResultCard
        status={response.data.status}
        emailVerifiedAt={response.data.emailVerifiedAt}
        shouldSyncSession={Boolean(session?.user)}
      />
    </section>
  );
}
