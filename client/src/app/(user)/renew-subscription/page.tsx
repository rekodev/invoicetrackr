import { getUser } from '@/api';
import { auth } from '@/auth';
import PaymentForm from '@/components/payment-form';

export default async function RenewSubscriptionPage() {
  const session = await auth();

  if (!session?.user.id) return null;

  const { data: user } = await getUser(Number(session.user.id));

  return (
    <section className="mx-auto w-full">
      <div className="mb-8 flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your subscription is no longer active
        </h1>
        <p className="text-lg text-default-500">
          Please renew your subscription to continue accessing all features and
          services.
        </p>
      </div>
      <PaymentForm user={user} />
    </section>
  );
}
