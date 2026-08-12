import { redirect } from 'next/navigation';

import { PAYMENT_METHODS_PAGE } from '@/lib/constants/pages';

async function BankingInformationPage() {
  redirect(PAYMENT_METHODS_PAGE);
}

export default BankingInformationPage;
