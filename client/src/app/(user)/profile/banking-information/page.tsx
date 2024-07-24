import { getBankingInformation, getUser } from '@/api';
import BankingInformationForm from '@/components/profile/BankingInformationForm';

async function BankingInformationPage() {
  const user = (await getUser(1)).data;
  const bankingInformation = (await getBankingInformation(user.id!)).data;

  return (
    <BankingInformationForm
      user={user}
      bankingInformation={bankingInformation}
    />
  );
}

export default BankingInformationPage;
