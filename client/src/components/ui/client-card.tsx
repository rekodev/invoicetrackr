'use client';

import { UserIcon } from '@heroicons/react/24/outline';
import { Card, CardBody, cn } from '@heroui/react';

import { Currency } from '@/lib/types/currency';
import { ClientModel } from '@/lib/types/models/client';
import { getCurrencySymbol } from '@/lib/utils/currency';

type Props = {
  currency?: Currency;
  client: Partial<ClientModel>;
  onClick?: () => void;
  amount?: number;
  hideIcon?: boolean;
  truncate?: boolean;
};

const ClientCard = ({
  truncate,
  currency,
  client,
  onClick,
  amount,
  hideIcon
}: Props) => {
  return (
    <div onClick={onClick}>
      <Card
        isHoverable={!!onClick}
        className={cn('border-default-200 justify-center border', {
          'cursor-pointer': !!onClick
        })}
      >
        <CardBody className="flex min-h-[70px] min-w-72 flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!hideIcon && (
              <div className="item-center rounded-medium border-default-200 flex border p-2">
                <UserIcon className="h-5 w-5" />
              </div>
            )}
            <div>
              <div
                className={cn(
                  'text-small truncate pb-0.5 font-bold uppercase',
                  { 'lg:max-w-40 lg:truncate': truncate }
                )}
              >
                {client.name}
              </div>
              <div className="text-default-500 flex gap-2 text-xs">
                {client.address && <span>{client.address}</span>}
                <span className={cn('', { 'max-w-40 truncate': truncate })}>
                  {client.email}
                </span>
              </div>
            </div>
          </div>
          {amount && currency && (
            <div className="right-3 flex gap-[1px] text-lg font-medium">
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
