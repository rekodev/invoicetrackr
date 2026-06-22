import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import LoginForm from '@/components/auth/login-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('login');

  return {
    title: t('page_title'),
    description: t('page_description'),
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false }
    },
    alternates: {
      canonical: '/login',
      languages: {
        en: '/login',
        lt: '/login'
      }
    }
  };
}

export default function LogInPage() {
  return (
    <section className="flex flex-1 items-center justify-center">
      <LoginForm />
    </section>
  );
}
