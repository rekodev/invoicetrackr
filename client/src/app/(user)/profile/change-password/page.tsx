import ChangePasswordForm from '@/components/profile/change-password-form';
import { auth } from '@/auth';

const ChangePasswordPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <ChangePasswordForm userId={Number(session.user.id)} />;
};

export default ChangePasswordPage;
