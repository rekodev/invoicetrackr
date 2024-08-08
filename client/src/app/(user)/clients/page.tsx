import { auth } from '@/auth';
import ClientSection from '@/components/client/ClientSection';

const ClientsPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <ClientSection userId={Number(session.user.id)} />;
};

export default ClientsPage;
