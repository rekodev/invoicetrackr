import {
  BanknotesIcon,
  ClockIcon,
  DocumentCurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { Card, cn } from '@heroui/react';
import { useTranslations } from 'next-intl';

export default function DashboardMetricGrid() {
  const t = useTranslations('home.preview.dashboard.cards');
  const cards = [
    {
      key: 'paid',
      icon: BanknotesIcon,
      iconClassName: 'bg-success/15 text-success'
    },
    {
      key: 'pending',
      icon: ClockIcon,
      iconClassName: 'bg-warning/15 text-warning'
    },
    {
      key: 'invoices',
      icon: DocumentCurrencyDollarIcon,
      iconClassName: 'bg-accent/15 text-accent'
    },
    {
      key: 'clients',
      icon: UsersIcon,
      iconClassName: 'bg-accent/15 text-accent'
    }
  ] as const;

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ key, icon: Icon, iconClassName }) => (
        <Card key={key} className="border bg-transparent shadow-none">
          <Card.Content className="flex h-full flex-col justify-between p-0 sm:p-3">
            <div className="text-muted flex items-center gap-2 text-xs font-medium">
              <span
                className={cn(
                  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                  iconClassName
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              {t(`${key}.label`)}
            </div>
            <p className="mt-4 text-xl font-semibold tabular-nums">
              {t(`${key}.value`)}
            </p>
          </Card.Content>
        </Card>
      ))}
    </section>
  );
}
