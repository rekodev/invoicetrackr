import { getUser } from '@/api';
import { auth } from '@/auth';
import PersonalInformationForm from '@/components/profile/personal-information-form';

async function PersonalInformationPage() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const { data: user } = await getUser(Number(session.user.id));

  return <PersonalInformationForm defaultValues={user} />;
}

export default PersonalInformationPage;
