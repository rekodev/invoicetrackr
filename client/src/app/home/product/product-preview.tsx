import { Card, Chip, cn } from '@heroui/react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import DashboardPagePreview from '../dashboard-page-preview';
import { useTranslations } from 'next-intl';

export default function ProductPreview() {
  const t = useTranslations('home.preview');

  const navItems = [
    { icon: ChartBarIcon, key: 'dashboard', active: true, disabled: false },
    { icon: DocumentTextIcon, key: 'invoices', active: false, disabled: false },
    { icon: UserGroupIcon, key: 'clients', active: false, disabled: false },
    { icon: PencilSquareIcon, key: 'contracts', active: false, disabled: true }
  ] as const;

  return (
    <div className="relative mx-auto mt-20 max-w-6xl">
      <div className="landing-glow-mint text-accent absolute -inset-x-16 -inset-y-10 blur-2xl" />
      <Card className="bg-background/80 shadow-default-200/40 relative overflow-hidden rounded-2xl border p-0 shadow-2xl backdrop-blur dark:bg-zinc-900/85 dark:shadow-black/60">
        <Card.Header className="bg-default-50/80 flex-row items-center gap-3 border-b px-4 py-2.5 dark:bg-zinc-900/90">
          <div className="flex gap-1.5">
            <span className="bg-danger h-2.5 w-2.5 rounded-full" />
            <span className="bg-warning h-2.5 w-2.5 rounded-full" />
            <span className="bg-success h-2.5 w-2.5 rounded-full" />
          </div>
          <div className="bg-default mx-auto flex max-w-md flex-1 items-center justify-center rounded-md px-3 py-1 text-center text-[11px] dark:bg-zinc-800/80 dark:text-zinc-400">
            invoicetrackr.app / dashboard
          </div>
        </Card.Header>

        <div className="-mt-3 grid grid-cols-12">
          <aside className="bg-default/60 hidden border-r p-4 text-start md:col-span-3 md:block dark:bg-zinc-950/40">
            <div className="section-eyebrow text-default-500 mb-4 dark:text-zinc-500">
              {t('sidebar.eyebrow')}
            </div>
            {navItems.map(({ icon: Icon, key, active, disabled }) => (
              <div
                key={key}
                className={cn(
                  'rounded-medium mb-1 flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs',
                  active
                    ? 'bg-accent/15 text-foreground ring-accent/20 ring-1 dark:bg-white/[0.08] dark:text-zinc-100 dark:ring-white/[0.06]'
                    : 'text-default-500 dark:text-zinc-500',
                  disabled && 'opacity-60'
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  {t(`sidebar.${key}`)}
                </span>
                {disabled && (
                  <Chip size="sm" variant="soft" color="warning">
                    {t('sidebar.soon')}
                  </Chip>
                )}
              </div>
            ))}
          </aside>

          <div className="text-foreground bg-default-50/20 col-span-12 p-4 text-start md:col-span-9 md:p-6 dark:bg-zinc-900/25">
            <DashboardPagePreview />
          </div>
        </div>
      </Card>
    </div>
  );
}
