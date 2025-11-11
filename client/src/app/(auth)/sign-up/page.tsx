import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import MultiStepForm from '@/components/multi-step-form';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('sign_up');

  return {
    title: t('page_title'),
    description: t('page_description'),
    alternates: {
      canonical: '/sign-up',
      languages: {
        'en': '/sign-up',
        'lt': '/sign-up'
      }
    },
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false }
    }
  };
}

export default function SignUpPage() {
  return <MultiStepForm />;
}
