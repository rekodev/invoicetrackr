import { unauthorized } from 'next/navigation';

import { getBankingInformationEntries } from '@/api/banking-information';
import { getClients } from '@/api/client';
import { getCryptoWallets } from '@/api/crypto-wallet';
import { getUser } from '@/api/user';
import { auth } from '@/auth';
import InvoiceForm from '@/components/invoice/invoice-form';
import { isResponseError } from '@/lib/utils/error';

const AddNewInvoicePage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const numericUserId = Number(session.user.id);

  const userResp = await getUser(numericUserId);
  if (isResponseError(userResp)) unauthorized();

  const [clientsResp, bankingInformationEntriesResp, cryptoWalletsResp] =
    await Promise.all([
      getClients(numericUserId),
      getBankingInformationEntries(numericUserId),
      getCryptoWallets(numericUserId)
    ]);

  if (
    isResponseError(clientsResp) ||
    isResponseError(bankingInformationEntriesResp) ||
    isResponseError(cryptoWalletsResp)
  )
    throw new Error('Failed to load data');

  return (
    <section className="w-full">
      <InvoiceForm
        user={userResp.data.user}
        bankingInformationEntries={
          bankingInformationEntriesResp.data.bankAccounts
        }
        cryptoWallets={cryptoWalletsResp.data.cryptoWallets}
        currency={session.user.currency}
        clients={clientsResp.data.clients}
      />
    </section>
  );
};

export default AddNewInvoicePage;
