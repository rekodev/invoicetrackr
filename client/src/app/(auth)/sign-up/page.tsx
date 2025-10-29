import { Metadata } from 'next';

import MultiStepForm from '@/components/multi-step-form';

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create your InvoiceTrackr account.',
  alternates: { canonical: '/sign-up' },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false }
  }
};

export default function SignUpPage() {
  return <MultiStepForm />;
}
