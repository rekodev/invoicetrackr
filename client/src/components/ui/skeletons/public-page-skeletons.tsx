import {
  BasicCardGridSkeleton,
  BasicCardSkeleton
} from './basic-card-skeleton';

export function AuthPageSkeleton() {
  return (
    <section className="flex flex-1 items-center justify-center">
      <BasicCardSkeleton className="min-h-[460px] max-w-lg" />
    </section>
  );
}

export function CreateInvoicePageSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-8 sm:py-10 md:py-12 lg:py-14">
      <BasicCardSkeleton className="min-h-40" />
      <BasicCardSkeleton className="min-h-[720px]" />
    </section>
  );
}

export function PublicInvoicePageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <BasicCardGridSkeleton
        count={2}
        className="lg:grid-cols-[minmax(0,1fr)_360px]"
        cardClassName="min-h-[720px]"
      />
    </main>
  );
}

export function LegalPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-8">
      <BasicCardSkeleton className="min-h-[640px]" />
    </main>
  );
}
