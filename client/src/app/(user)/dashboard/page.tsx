import { auth } from '@/auth';
import DashboardCards from '@/components/dashboard/dashboard-cards';

const DashboardPage = async () => {
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <main className='flex flex-col gap-4'>
      <DashboardCards
        userId={Number(session.user.id)}
        currency={session.user.currency}
      />
    </main>
  );
};

export default DashboardPage;
