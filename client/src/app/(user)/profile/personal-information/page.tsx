import { getUser } from '@/api';
import PersonalInformationForm from '@/components/profile/PersonalInformationForm';

async function PersonalInformationPage() {
  const user = await getUser(1);

  return <PersonalInformationForm user={user.data} />;
}

export default PersonalInformationPage;
