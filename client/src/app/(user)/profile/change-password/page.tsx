import { auth } from '@/auth';
import ChangePasswordForm from '@/components/profile/change-password-form';

const ChangePasswordPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <ChangePasswordForm
      userId={Number(session.user.id)}
      language={session.user.language}
    />
  );
};

export default ChangePasswordPage;
