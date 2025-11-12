import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import AppLogo from '@/components/app-logo';
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

export default async function LogInPage() {
  const t = await getTranslations('login');

  return (
    <section className="flex flex-col items-center justify-center gap-4 px-6 py-8">
      <AppLogo width={80} height={80} />
      <div className="mb-6 flex flex-col items-center justify-center gap-1">
        <h2 className="text-2xl font-medium">{t('welcome')}</h2>
        <p className="text-default-500">{t('subtitle')}</p>
      </div>
      <LoginForm />
    </section>
  );
}
