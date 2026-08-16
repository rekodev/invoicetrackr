import { unauthorized } from 'next/navigation';

import { getBankingInformationEntries } from '@/api/banking-information';
import { getCryptoWallets } from '@/api/crypto-wallet';
import { auth } from '@/auth';
import PaymentMethodsForm from '@/components/profile/payment-methods-form';
import { isResponseError } from '@/lib/utils/error';

export default async function PaymentMethodsPage() {
  const session = await auth();
  if (!session?.user?.id) unauthorized();
  const userId = Number(session.user.id);
  const [banks, wallets] = await Promise.all([
    getBankingInformationEntries(userId),
    getCryptoWallets(userId)
  ]);
  if (isResponseError(banks) || isResponseError(wallets))
    throw new Error('Failed to load payment methods');
  return (
    <PaymentMethodsForm
      user={session.user}
      bankAccounts={banks.data.bankAccounts}
      cryptoWallets={wallets.data.cryptoWallets}
    />
  );
}
