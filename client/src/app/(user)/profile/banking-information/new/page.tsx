import BankAccountForm from '@/components/profile/bank-account-form';
import { auth } from '@/auth';

const AddNewBankAccount = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <BankAccountForm userId={Number(session.user.id)} />;
};

export default AddNewBankAccount;
