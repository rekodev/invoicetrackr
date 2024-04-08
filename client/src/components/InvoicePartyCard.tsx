'use client';

import { Card, CardBody, CardHeader } from '@nextui-org/react';
import { ReactNode } from 'react';

import { ClientModel } from '@/types/models/client';
import { InvoicePartyType } from '@/types/models/invoice';
import { UserModel } from '@/types/models/user';

/* 
  InvoicePartyCard accepts a renderActions prop which renders actions on the top right of the card
  The renderActions can have either UserModel or ClientModel as args if at least one action depends on the data inside of the card
  Or it can have no actions at all if all the logic can be handled outside
*/

type PartyData = UserModel | ClientModel;

type Props = {
  partyType: InvoicePartyType;
  partyData: PartyData | undefined;
  insideForm?: boolean;
  renderActions?: (partyData: PartyData | undefined) => ReactNode;
};

const InvoicePartyCard = ({
  partyType,
  partyData,
  insideForm = false,
  renderActions,
}: Props) => {
  const smallText = partyType === 'receiver' ? 'To:' : 'From:';

  if (!partyData)
    return (
      <Card className='p-2 w-full'>
        <CardHeader>
          {insideForm && (
            <small className='text-default-500'>{smallText}</small>
          )}
        </CardHeader>
        {renderActions?.(partyData)}
      </Card>
    );

  const { address, businessNumber, businessType, name, email } = partyData;

  return (
    <Card className='p-2 relative w-full'>
      <CardHeader className='pb-0 flex-col items-start'>
        {insideForm && <small className='text-default-500'>{smallText}</small>}
        <h4 className='font-bold text-large uppercase'>{name}</h4>
      </CardHeader>
      <CardBody className='overflow-visible py-2'>
        <p className='text-tiny uppercase font-bold'>
          {businessType} No. {businessNumber}
        </p>
        <small className='text-default-500'>{address}</small>
        {email && <small className='text-default-500'>{email}</small>}
      </CardBody>
      {renderActions?.(partyData)}
    </Card>
  );
};

export default InvoicePartyCard;
