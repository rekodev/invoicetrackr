import { auth } from '@/auth';
import BankAccountForm from '@/components/profile/bank-account-form';

const AddNewBankAccount = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <BankAccountForm userId={Number(session.user.id)} />;
};

export default AddNewBankAccount;
