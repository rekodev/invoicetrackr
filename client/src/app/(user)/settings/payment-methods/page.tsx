import { unauthorized } from 'next/navigation';

import { getBankingInformationEntries } from '@/api/banking-information';
import { auth } from '@/auth';
import BankingInformationForm from '@/components/profile/banking-information-form';
import { isResponseError } from '@/lib/utils/error';

export default async function PaymentMethodsPage() {
  const session = await auth();
  if (!session?.user?.id) unauthorized();
  const userId = Number(session.user.id);
  const banks = await getBankingInformationEntries(userId);
  if (isResponseError(banks))
    throw new Error('Failed to load payment methods');
  return (
    <BankingInformationForm
      user={session.user}
      bankAccounts={banks.data.bankAccounts}
    />
  );
}
