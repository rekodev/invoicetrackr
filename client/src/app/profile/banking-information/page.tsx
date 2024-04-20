import ProfilePageLayout from '@/components/layouts/ProfilePageLayout';
import BankingInformationForm from '@/components/user/BankingInformationForm';

const BankingInformationPage = () => {
  return <ProfilePageLayout ProfileComponent={BankingInformationForm} />;
};

export default BankingInformationPage;
