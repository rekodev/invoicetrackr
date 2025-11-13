import { unauthorized } from 'next/navigation';

import InvoiceForm from '@/components/invoice/invoice-form';
import { auth } from '@/auth';
import { getBankingInformationEntries } from '@/api/banking-information';
import { getClients } from '@/api/client';
import { getInvoice } from '@/api/invoice';
import { getUser } from '@/api/user';
import { isResponseError } from '@/lib/utils/error';

type Params = Promise<{ invoiceId: string }>;

const EditInvoicePage = async ({ params }: { params: Params }) => {
  const { invoiceId } = await params;
  const session = await auth();

  if (!session?.user?.id) unauthorized();

  const numericUserId = Number(session.user.id);

  const userResponse = await getUser(numericUserId);

  if (isResponseError(userResponse)) unauthorized();

  const [invoiceResp, clientsResp, bankingInformationEntriesResp] =
    await Promise.all([
      getInvoice(numericUserId, Number(invoiceId)),
      getClients(numericUserId),
      getBankingInformationEntries(numericUserId)
    ]);

  if (
    isResponseError(invoiceResp) ||
    isResponseError(clientsResp) ||
    isResponseError(bankingInformationEntriesResp)
  )
    throw new Error('Failed to load data');

  return (
    <section>
      <InvoiceForm
        user={userResponse.data.user}
        clients={clientsResp.data.clients}
        currency={session.user.currency}
        invoiceData={invoiceResp.data.invoice}
        bankingInformationEntries={
          bankingInformationEntriesResp.data.bankAccounts
        }
      />
    </section>
  );
};

export default EditInvoicePage;
