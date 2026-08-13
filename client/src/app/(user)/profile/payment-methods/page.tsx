import { unauthorized } from 'next/navigation';

import { getBankingInformationEntries } from '@/api/banking-information';
import { getCryptoWallets } from '@/api/crypto-wallet';
import { auth } from '@/auth';
import BankingInformationForm from '@/components/profile/banking-information-form';
import CryptoWalletsForm from '@/components/profile/crypto-wallets-form';
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
    <div className="flex flex-col gap-8">
      <BankingInformationForm
        user={session.user}
        bankAccounts={banks.data.bankAccounts}
      />
      <CryptoWalletsForm userId={userId} wallets={wallets.data.cryptoWallets} />
    </div>
  );
}
