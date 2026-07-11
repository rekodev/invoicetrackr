import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import ForgotPasswordForm from '@/components/auth/forgot-password-form';
import { FORGOT_PASSWORD_PAGE } from '@/lib/constants/pages';
import { getNoIndexMetadata } from '@/lib/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('forgot_password');

  return getNoIndexMetadata({
    title: t('title'),
    description: t('description'),
    canonical: FORGOT_PASSWORD_PAGE
  });
}

export default function ForgotPasswordPage() {
  return (
    <section className="flex flex-1 items-center justify-center">
      <ForgotPasswordForm />
    </section>
  );
}
