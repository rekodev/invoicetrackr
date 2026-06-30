import {
  BanknotesIcon,
  ClockIcon,
  DocumentCurrencyDollarIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { Card } from '@heroui/react';
import { useTranslations } from 'next-intl';

import IconContainer from '@/components/ui/icon-container';

export default function DashboardMetricGrid() {
  const t = useTranslations('home.preview.dashboard.cards');
  const cards = [
    {
      key: 'paid',
      icon: BanknotesIcon,
      iconVariant: 'success'
    },
    {
      key: 'pending',
      icon: ClockIcon,
      iconVariant: 'warning'
    },
    {
      key: 'invoices',
      icon: DocumentCurrencyDollarIcon,
      iconVariant: 'accent'
    },
    {
      key: 'clients',
      icon: UsersIcon,
      iconVariant: 'accent'
    }
  ] as const;

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ key, icon: Icon, iconVariant }) => (
        <Card key={key} variant="secondary" className="border">
          <Card.Content className="flex h-full flex-col justify-between p-0 sm:p-3">
            <div className="text-muted flex items-center gap-2 text-xs font-medium">
              <IconContainer size="sm" variant={iconVariant}>
                <Icon className="h-3.5 w-3.5" />
              </IconContainer>
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
