import { notFound, unauthorized } from 'next/navigation';

import { getClientWorkspace } from '@/api/client';
import { auth } from '@/auth';
import ClientWorkspace from '@/components/client/client-workspace';
import { isResponseError } from '@/lib/utils/error';

type Props = { params: Promise<{ clientId: string }> };

export default async function ClientWorkspacePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) unauthorized();
  const { clientId } = await params;
  if (!/^[1-9]\d*$/.test(clientId)) notFound();

  const userId = Number(session.user.id);
  const response = await getClientWorkspace(userId, Number(clientId));
  if (isResponseError(response)) {
    if (response.status === 404) notFound();
    throw new Error('Failed to load client workspace');
  }

  return <ClientWorkspace userId={userId} data={response.data} />;
}
