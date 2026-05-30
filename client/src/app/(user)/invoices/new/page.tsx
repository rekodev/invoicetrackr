import { unauthorized } from 'next/navigation';

import InvoiceForm from '@/components/invoice/invoice-form';
import { auth } from '@/auth';
import { getBankingInformationEntries } from '@/api/banking-information';
import { getClients } from '@/api/client';
import { getUser } from '@/api/user';
import { isResponseError } from '@/lib/utils/error';

const AddNewInvoicePage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const numericUserId = Number(session.user.id);

  const userResp = await getUser(numericUserId);
  if (isResponseError(userResp)) unauthorized();

  const [clientsResp, bankingInformationEntriesResp] = await Promise.all([
    getClients(numericUserId),
    getBankingInformationEntries(numericUserId)
  ]);

  if (
    isResponseError(clientsResp) ||
    isResponseError(bankingInformationEntriesResp)
  )
    throw new Error('Failed to load data');

  return (
    <section className="w-full">
      <InvoiceForm
        user={userResp.data.user}
        bankingInformationEntries={
          bankingInformationEntriesResp.data.bankAccounts
        }
        currency={session.user.currency}
        clients={clientsResp.data.clients}
      />
    </section>
  );
};

export default AddNewInvoicePage;
