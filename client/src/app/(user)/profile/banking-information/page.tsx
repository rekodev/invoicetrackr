import BankingInformationForm from '@/components/profile/banking-information-form';
import { auth } from '@/auth';
import { getBankingInformationEntries } from '@/api/banking-information';
import { isResponseError } from '@/lib/utils/error';

async function BankingInformationPage() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const bankingInformationResp = await getBankingInformationEntries(
    Number(session.user.id)
  );

  if (isResponseError(bankingInformationResp))
    throw new Error('Failed to fetch data');

  return (
    <BankingInformationForm
      user={session.user}
      bankAccounts={bankingInformationResp.data?.bankAccounts}
    />
  );
}

export default BankingInformationPage;
