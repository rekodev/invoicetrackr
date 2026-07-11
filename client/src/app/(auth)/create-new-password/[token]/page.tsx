import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getUserResetPasswordToken } from '@/api/user';
import CreateNewPasswordForm from '@/components/auth/create-new-password-form';
import InvalidTokenCard from '@/components/auth/invalid-token-card';
import { getNoIndexMetadata } from '@/lib/seo/metadata';
import { isResponseError } from '@/lib/utils/error';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('create_new_password');

  return getNoIndexMetadata({
    title: t('title'),
    description: t('description'),
    canonical: '/create-new-password',
    referrer: 'no-referrer'
  });
}

type Props = {
  params: Promise<{ token: string }>;
};

export default async function CreateNewPasswordPage({ params }: Props) {
  const { token } = await params;

  const response = await getUserResetPasswordToken(token);

  if (isResponseError(response)) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <InvalidTokenCard />
      </section>
    );
  }

  return (
    <section className="flex flex-1 items-center justify-center">
      <CreateNewPasswordForm userId={response.data.userId} token={token} />
    </section>
  );
}
