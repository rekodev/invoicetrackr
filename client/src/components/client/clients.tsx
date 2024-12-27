import { getClients } from '@/api';
import ClientSection from './ClientSection';

type Props = {
  userId: number;
};

const Clients = async ({ userId }: Props) => {
  const {
    data: { clients },
  } = await getClients(userId);

  return <ClientSection userId={userId} clients={clients} />;
};

export default Clients;
