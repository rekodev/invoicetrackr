import { getUser } from '@/api';
import BankingInformationForm from '@/components/profile/BankingInformationForm';

async function BankingInformationPage() {
  const user = await getUser(1);

  return <BankingInformationForm user={user.data} />;
}

export default BankingInformationPage;
