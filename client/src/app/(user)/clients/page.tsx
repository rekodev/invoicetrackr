import { getClients } from '@/api';
import { auth } from '@/auth';
import ClientSection from '@/components/client/client-section';

const ClientsPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  const {
    data: { clients }
  } = await getClients(Number(session.user.id));

  return (
    <ClientSection userId={Number(session.user.id)} clients={clients || []} />
  );
};

export default ClientsPage;
