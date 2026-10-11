import { WalletIcon } from '@heroicons/react/24/outline';
import { buttonVariants, Card, Chip } from '@heroui/react';
import type { DashboardSafeToSpend } from '@invoicetrackr/types';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import IconContainer from '@/components/ui/icon-container';
import InfoPopover from '@/components/ui/info-popover';
import { TAX_SUPPORTED_YEARS } from '@/lib/constants/tax';
import { formatMoney } from '@/lib/utils/currency';
import { taxEstimateHref } from '@/lib/utils/tax';

import SafeToSpendBreakdown from './safe-to-spend-breakdown';

type Props = { safeToSpend: DashboardSafeToSpend; year: number };

const SafeToSpendCard = async ({ safeToSpend, year }: Props) => {
  const t = await getTranslations('dashboard.safe_to_spend');
  const locale = await getLocale();
  const taxHref = taxEstimateHref(year);

  const value = () => {
    if (safeToSpend.status === 'ready') {
      return (
        <div className="flex flex-col items-start gap-1">
          <p className="text-2xl font-semibold tabular-nums">
            {formatMoney(safeToSpend.safeToSpend, locale)}
          </p>
          {Number(safeToSpend.shortfall) > 0 && (
            <Chip size="sm" variant="soft" color="danger">
              {t('shortfall', {
                amount: formatMoney(safeToSpend.shortfall, locale)
              })}
            </Chip>
          )}
        </div>
      );
    }

    if (safeToSpend.status === 'needs_profile') {
      return (
        <Link href={taxHref} className={buttonVariants({ size: 'sm' })}>
          {t('set_up')}
        </Link>
      );
    }

    return (
      <p className="text-muted text-sm">
        {t('unsupported', { years: TAX_SUPPORTED_YEARS.join(', ') })}
      </p>
    );
  };

  return (
    <Card className="h-full border">
      <Card.Content className="flex h-full flex-col items-start justify-between gap-5">
        <div className="text-muted flex items-center gap-2 text-sm font-medium">
          <IconContainer size="sm" variant="success">
            <WalletIcon className="h-4 w-4" />
          </IconContainer>
          <h2>{t('title')}</h2>
          <span className="-my-2">
            <InfoPopover title={t('info.title')} placement="bottom end">
              <SafeToSpendBreakdown safeToSpend={safeToSpend} year={year} />
              <p className="text-muted">{t('info.reserve')}</p>
              <p className="text-muted">{t('info.payments')}</p>
              {safeToSpend.status === 'ready' && (
                <Link
                  href={taxHref}
                  className={buttonVariants({
                    variant: 'outline',
                    size: 'sm',
                    className: 'self-start'
                  })}
                >
                  {t('tax_breakdown')}
                </Link>
              )}
            </InfoPopover>
          </span>
        </div>
        {value()}
      </Card.Content>
    </Card>
  );
};

export default SafeToSpendCard;
