import { auth } from '@/auth';
import BankingInformationForm from '@/components/profile/banking-information-form';

async function BankingInformationPage() {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <BankingInformationForm userId={Number(session.user.id)} />;
}

export default BankingInformationPage;
