import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { auth } from '@/auth';
import VerifyEmailResultCard from '@/components/auth/verify-email-result-card';
import { VERIFY_EMAIL_PAGE } from '@/lib/constants/pages';
import { getNoIndexMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('verify_email.pending');

  return getNoIndexMetadata({
    title: t('title'),
    description: t('description'),
    canonical: VERIFY_EMAIL_PAGE,
    referrer: 'no-referrer'
  });
}

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
