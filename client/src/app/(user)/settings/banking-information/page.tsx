import { permanentRedirect } from 'next/navigation';

import { PAYMENT_METHODS_PAGE } from '@/lib/constants/pages';

export default function BankingInformationPage() {
  permanentRedirect(PAYMENT_METHODS_PAGE);
}
