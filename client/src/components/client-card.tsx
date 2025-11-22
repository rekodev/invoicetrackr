'use client';

import { Card, CardBody, cn } from '@heroui/react';
import { CheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { JSX } from 'react';

import { Client } from '@invoicetrackr/types';
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
  const renderSelectedIcon = () => {
    if (!isSelected) return null;

    return (
      <div className="bg-secondary-600 absolute right-3 top-3 rounded-full p-0.5">
        <CheckIcon className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="relative" onClick={onClick}>
      {!!actions && actions}
      <Card
        onPress={onClick}
        isPressable={!!onClick}
        isHoverable={!!onClick}
        className={cn(
          'border-default-200 relative h-full w-full justify-center border',
          {
            'cursor-pointer': !!onClick,
            'border-secondary-600 bg-secondary/10': isSelected
          }
        )}
      >
        {renderSelectedIcon()}
        <CardBody className="flex min-h-[70px] flex-row items-center justify-between gap-4">
          <div
            className={cn('flex max-w-full items-center gap-3', {
              'max-w-2/3': truncate
            })}
          >
            {!hideIcon && (
              <div className="item-center rounded-medium border-default-200 flex border p-2">
                <UserIcon className="h-5 w-5" />
              </div>
            )}
            <div className="max-w-full">
              <div
                className={cn(
                  'text-small truncate pb-0.5 font-bold uppercase',
                  { 'lg:truncate': truncate }
                )}
              >
                {client.name}
              </div>
              <div className="text-default-500 flex flex-col gap-1 text-xs">
                {fullDetails && (
                  <p className="text-tiny font-bold uppercase">
                    {client.businessType} No. {client.businessNumber}
                  </p>
                )}
                {client.address && <span>{client.address}</span>}
                <span className={cn('', { 'max-w-40 truncate': truncate })}>
                  {client.email}
                </span>
              </div>
            </div>
          </div>
          {amount && currency && (
            <div className="flex gap-[1px] text-lg font-medium">
              <span className="text-success-700">
                {getCurrencySymbol(currency)}
              </span>
              {Number(amount).toFixed(2)}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ClientCard;
