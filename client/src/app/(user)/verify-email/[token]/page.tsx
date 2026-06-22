import type { Metadata } from 'next';

import VerifyEmailResultCard from '@/components/auth/verify-email-result-card';
import { auth } from '@/auth';

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
  const session = await auth();

  return (
    <section className="flex flex-1 items-center justify-center">
      <VerifyEmailResultCard
        status="pending"
        token={token}
        shouldSyncSession={Boolean(session?.user)}
      />
    </section>
  );
}
