import { permanentRedirect } from 'next/navigation';

import { PAYMENT_METHODS_PAGE } from '@/lib/constants/pages';

async function BankingInformationPage() {
  permanentRedirect(PAYMENT_METHODS_PAGE);
}

export default BankingInformationPage;
