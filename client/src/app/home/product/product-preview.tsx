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
      <Card className="relative overflow-hidden border p-0">
        <Card.Header className="flex-row items-center gap-3 border-b px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="bg-danger h-2.5 w-2.5 rounded-full" />
            <span className="bg-warning h-2.5 w-2.5 rounded-full" />
            <span className="bg-success h-2.5 w-2.5 rounded-full" />
          </div>
          <div className="bg-default mx-auto flex max-w-md flex-1 items-center justify-center rounded-md px-3 py-1 text-center text-[11px]">
            invoicetrackr.app / dashboard
          </div>
        </Card.Header>

        <div className="-mt-3 grid grid-cols-12">
          <aside className="hidden border-r p-4 text-start md:col-span-3 md:block">
            <div className="section-eyebrow text-muted mb-4">
              {t('sidebar.eyebrow')}
            </div>
            {navItems.map(({ icon: Icon, key, active, disabled }) => (
              <div
                key={key}
                className={cn(
                  'rounded-medium mb-1 flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs',
                  active
                    ? 'bg-accent/15 text-foreground ring-accent/20 ring-1'
                    : 'text-muted',
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

          <div className="text-foreground col-span-12 p-4 text-start md:col-span-9 md:p-6">
            <DashboardPagePreview />
          </div>
        </div>
      </Card>
    </div>
  );
}
