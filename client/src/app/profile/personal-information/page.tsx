import ProfilePageLayout from '@/components/layouts/ProfilePageLayout';
import PersonalInformationForm from '@/components/user/PersonalInformationForm';

const PersonalInformationPage = () => {
  return <ProfilePageLayout ProfileComponent={PersonalInformationForm} />;
};

export default PersonalInformationPage;
