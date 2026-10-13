import {
  BanknotesIcon,
  ClockIcon,
  DocumentTextIcon,
  WalletIcon
} from '@heroicons/react/24/outline';
import { Card } from '@heroui/react';
import { useTranslations } from 'next-intl';

import IconContainer from '@/components/ui/icon-container';

const cards = [
  { key: 'received_income', icon: BanknotesIcon, iconVariant: 'success' },
  { key: 'invoiced', icon: DocumentTextIcon, iconVariant: 'accent' },
  { key: 'outstanding', icon: ClockIcon, iconVariant: 'warning' },
  { key: 'safe_to_spend', icon: WalletIcon, iconVariant: 'success' }
] as const;

export default function DashboardMetricGrid() {
  const t = useTranslations('home.preview.dashboard.cards');

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ key, icon: Icon, iconVariant }) => (
        <Card key={key} variant="secondary" className="border">
          <Card.Content className="flex h-full flex-col justify-between p-0 sm:p-3">
            <div className="text-muted flex items-start gap-2 text-xs font-medium">
              <IconContainer size="sm" variant={iconVariant}>
                <Icon className="h-3.5 w-3.5" />
              </IconContainer>
              {t(`${key}.label`)}
            </div>
            <p className="mt-4 whitespace-nowrap text-lg font-semibold tabular-nums sm:text-xl">
              {t(`${key}.value`)}
            </p>
          </Card.Content>
        </Card>
      ))}
    </section>
  );
}
