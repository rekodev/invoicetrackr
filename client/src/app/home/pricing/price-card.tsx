import { CREATE_INVOICE_PAGE, SIGN_UP_PAGE } from '@/lib/constants/pages';
import { Card, Chip, Link, buttonVariants, cn } from '@heroui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';

import { PRICING_PLANS } from './constants';

export default function PriceCard({
  plan,
  currencySymbol,
  highlighted
}: {
  plan: (typeof PRICING_PLANS)[number];
  currencySymbol: string;
  highlighted?: boolean;
}) {
  const t = useTranslations(`home.pricing.${plan}`);
  const featureKeys =
    plan === 'free'
      ? (['single', 'download', 'languages', 'no_account'] as const)
      : (['saved', 'email', 'links', 'payments', 'export'] as const);

  return (
    <Card
      className={cn(
        'relative overflow-hidden border p-8',
        highlighted
          ? 'border-accent/40 shadow-accent/10 backdrop-blur-xs bg-transparent shadow-lg'
          : 'backdrop-blur-xs bg-transparent'
      )}
    >
      {highlighted && (
        <Chip
          color="success"
          size="sm"
          variant="soft"
          className="absolute right-6 top-6"
        >
          {t('badge')}
        </Chip>
      )}
      <Card.Header className="flex flex-col items-start gap-1 p-0">
        <Card.Title className="text-xl font-medium tracking-tight">
          {t('title')}
        </Card.Title>
        <Card.Description>{t('tagline')}</Card.Description>
      </Card.Header>
      <Card.Content className="p-0">
        <div className="mt-6 flex items-baseline gap-1">
          <span className="text-5xl font-medium tracking-tight">
            {plan === 'free' ? `${currencySymbol}0` : `${currencySymbol}49`}
          </span>
          {plan === 'premium' && (
            <span className="text-muted text-sm">{t('suffix')}</span>
          )}
        </div>
        {plan === 'premium' && (
          <div className="text-muted mt-1 text-[11px]">{t('alt')}</div>
        )}

        <ul className="mt-7 space-y-2.5">
          {featureKeys.map((key) => (
            <li
              key={key}
              className="text-muted flex items-start gap-2 text-sm"
            >
              <CheckIcon className="text-accent mt-0.5 h-3.5 w-3.5 shrink-0" />
              {t(`features.${key}`)}
            </li>
          ))}
        </ul>
      </Card.Content>
      <Card.Footer className="p-0">
        <Link
          href={plan === 'free' ? CREATE_INVOICE_PAGE : SIGN_UP_PAGE}
          className={buttonVariants({
            className: 'mt-8 w-full',
            variant: highlighted ? 'primary' : 'secondary'
          })}
        >
          {t('cta')}
        </Link>
      </Card.Footer>
    </Card>
  );
}
