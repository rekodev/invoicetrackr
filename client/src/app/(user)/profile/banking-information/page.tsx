import { getBankingInformationEntries } from '@/api';
import { auth } from '@/auth';
import BankingInformationForm from '@/components/profile/banking-information-form';

async function BankingInformationPage() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const bankingInformationResp = await getBankingInformationEntries(
    Number(session.user.id)
  );

  return (
    <BankingInformationForm
      user={session.user}
      bankAccounts={bankingInformationResp.data}
    />
  );
}

export default BankingInformationPage;
