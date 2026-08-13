import { redirect, unauthorized } from 'next/navigation';

import { getBankingInformationEntries } from '@/api/banking-information';
import { getClients } from '@/api/client';
import { getCryptoWallets } from '@/api/crypto-wallet';
import { getInvoice } from '@/api/invoice';
import { getUser } from '@/api/user';
import { auth } from '@/auth';
import InvoiceForm from '@/components/invoice/invoice-form';
import { INVOICES_PAGE } from '@/lib/constants/pages';
import { isResponseError } from '@/lib/utils/error';

type Params = Promise<{ invoiceId: string }>;

const EditInvoicePage = async ({ params }: { params: Params }) => {
  const { invoiceId } = await params;
  const session = await auth();

  if (!session?.user?.id) unauthorized();

  const numericUserId = Number(session.user.id);

  const userResponse = await getUser(numericUserId);

  if (isResponseError(userResponse)) unauthorized();

  const [
    invoiceResp,
    clientsResp,
    bankingInformationEntriesResp,
    cryptoWalletsResp
  ] = await Promise.all([
    getInvoice(numericUserId, Number(invoiceId)),
    getClients(numericUserId),
    getBankingInformationEntries(numericUserId),
    getCryptoWallets(numericUserId)
  ]);

  if (
    isResponseError(invoiceResp) ||
    isResponseError(clientsResp) ||
    isResponseError(bankingInformationEntriesResp) ||
    isResponseError(cryptoWalletsResp)
  )
    throw new Error('Failed to load data');

  if ((invoiceResp.data.invoice.lifecycleStatus || 'draft') !== 'draft')
    redirect(INVOICES_PAGE);

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
        cryptoWallets={cryptoWalletsResp.data.cryptoWallets}
      />
    </section>
  );
};

export default EditInvoicePage;
