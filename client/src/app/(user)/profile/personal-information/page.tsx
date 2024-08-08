import { auth } from '@/auth';
import PersonalInformationForm from '@/components/profile/PersonalInformationForm';

async function PersonalInformationPage() {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <PersonalInformationForm userId={Number(session.user.id)} />;
}

export default PersonalInformationPage;
