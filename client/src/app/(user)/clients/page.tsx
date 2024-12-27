import { auth } from '@/auth';
import Clients from '@/components/client/clients';

const ClientsPage = async () => {
  const session = await auth();
  const userId = Number(session?.user.id);

  if (!userId) return null;

  return <Clients userId={userId} />;
};

export default ClientsPage;
