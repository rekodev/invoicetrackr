'use client';

import { UserIcon } from '@heroicons/react/24/outline';
import { Card, CardBody } from '@nextui-org/react';

import { ClientModel } from '@/lib/types/models/client';
import { cn } from '@/lib/utils/cn';
import { getCurrencySymbol } from '@/lib/utils/currency';

type Props = {
  currency?: string;
  client: Partial<ClientModel>;
  onClick?: () => void;
  amount?: number;
};

const ClientCard = ({ currency, client, onClick, amount }: Props) => {
  return (
    <div onClick={onClick}>
      <Card
        isHoverable={!!onClick}
        className={cn('justify-center', {
          'cursor-pointer': !!onClick,
        })}
      >
        <CardBody className='flex flex-row justify-between items-center gap-4'>
          <div className='flex items-center gap-3'>
            <div className='item-center flex rounded-medium border p-2 border-default-200'>
              <UserIcon className='w-5 h-5' />
            </div>
            <div>
              <div className='pb-0.5 uppercase font-bold'>{client.name}</div>
              <div className='flex gap-2 text-small text-default-500'>
                {client.address && <span>{client.address}</span>}
                <span>{client.email}</span>
              </div>
            </div>
          </div>
          {amount && currency && (
            <div className='text-lg font-medium right-3'>
              {getCurrencySymbol(currency)}
              {Number(amount).toFixed(2)}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ClientCard;
