'use client';

import {
  BuildingOffice2Icon,
  CheckIcon,
  EnvelopeIcon,
  MapPinIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Card, Chip, cn } from '@heroui/react';
import { Client } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { JSX } from 'react';

import { Currency } from '@/lib/types/currency';
import { getCurrencySymbol } from '@/lib/utils/currency';

type Props = {
  isSelected?: boolean;
  currency?: Currency;
  client: Partial<Client>;
  onClick?: () => void;
  amount?: number;
  hideIcon?: boolean;
  truncate?: boolean;
  fullDetails?: boolean;
  actions?: JSX.Element;
};

const ClientCard = ({
  isSelected,
  truncate,
  currency,
  client,
  onClick,
  amount,
  hideIcon,
  fullDetails,
  actions
}: Props) => {
  const t = useTranslations('clients.card');
  const tTypes = useTranslations('clients.form_dialog.business_types');
  const isBusiness = client.businessType === 'business';

  const renderSelectedIcon = () => {
    if (!isSelected) return null;

    return (
      <div className="bg-secondary-600 absolute right-3 top-3 rounded-full p-0.5">
        <CheckIcon className="h-4 w-4" />
      </div>
    );
  };

  const renderCompactCard = () => (
    <Card
      className={cn('relative h-full w-full justify-center border', {
        'cursor-pointer': !!onClick,
        'border-secondary-600 bg-secondary/10': isSelected
      })}
    >
      {renderSelectedIcon()}
      <Card.Content className="flex min-h-[70px] flex-row items-start justify-between gap-4">
        <div
          className={cn('flex max-w-full items-start gap-3', {
            'max-w-2/3': truncate
          })}
        >
          {!hideIcon && (
            <div className="flex">
              <div className="item-center rounded-medium bg-default-100/50 flex border p-2">
                <UserIcon className="h-5 w-5" />
              </div>
            </div>
          )}
          <div className="max-w-full">
            <div
              className={cn('truncate pb-0.5 text-sm font-bold uppercase', {
                'lg:truncate': truncate
              })}
            >
              {client.name}
            </div>
            <div className="text-muted flex flex-col gap-1 text-xs">
              {client.address && <span>{client.address}</span>}
              <span className={cn('', { 'max-w-40 truncate': truncate })}>
                {client.email}
              </span>
            </div>
          </div>
        </div>
        {amount && currency && (
          <div className="flex gap-[1px] text-lg font-medium">
            <span className="text-success">{getCurrencySymbol(currency)}</span>
            {Number(amount).toFixed(2)}
          </div>
        )}
      </Card.Content>
    </Card>
  );

  const renderFullDetailsCard = () => (
    <Card
      className={cn(
        'hover:border-secondary/50 relative h-full w-full overflow-hidden border transition hover:shadow-md',
        {
          'cursor-pointer': !!onClick,
          'border-secondary-600 bg-secondary/10': isSelected
        }
      )}
    >
      {renderSelectedIcon()}
      <Card.Content className="flex h-full flex-col gap-4 px-2 py-1">
        <div className="flex items-start gap-4 pr-20 sm:pr-24">
          <div className="min-w-0 flex-1">
            {client.businessType && (
              <Chip
                size="sm"
                color={isBusiness ? 'accent' : 'success'}
                variant="soft"
                className="mb-2"
              >
                {tTypes(client.businessType)}
              </Chip>
            )}
            <div className="flex items-start gap-2">
              <Card.Title
                className={cn('truncate text-base font-semibold', {
                  'lg:truncate': truncate
                })}
              >
                {client.name}
              </Card.Title>
            </div>
            <div className="text-muted mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-wide">
              {client.businessNumber && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <BuildingOffice2Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{client.businessNumber}</span>
                </span>
              )}
              {client.vatNumber && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate">
                    {t('vat_number_label')} {client.vatNumber}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-muted flex flex-col gap-2 text-sm">
          {client.address && (
            <div className="flex items-start gap-2">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="text-foreground/80 truncate">
                {client.address}
              </span>
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2">
              <EnvelopeIcon className="h-4 w-4 shrink-0" />
              <span className="text-foreground/80 truncate">
                {client.email}
              </span>
            </div>
          )}
        </div>

        {amount && currency && (
          <div className="mt-auto flex gap-[1px] self-end text-lg font-medium">
            <span className="text-success">{getCurrencySymbol(currency)}</span>
            {Number(amount).toFixed(2)}
          </div>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <div className="group relative" onClick={onClick}>
      {!!actions && actions}
      {fullDetails ? renderFullDetailsCard() : renderCompactCard()}
    </div>
  );
};

export default ClientCard;
