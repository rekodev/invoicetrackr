import { auth } from '@/auth';
import AddNewBankAccountForm from '@/components/profile/AddNewBankAccountForm';

const AddNewBankAccount = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <AddNewBankAccountForm userId={Number(session.user.id)} />;
};

export default AddNewBankAccount;
