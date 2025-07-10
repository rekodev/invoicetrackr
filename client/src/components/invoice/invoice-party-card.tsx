'use client';

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { ReactNode } from 'react';

import { ClientModel } from '@/lib/types/models/client';
import { UserModel } from '@/lib/types/models/user';

/* 
  InvoicePartyCard accepts a renderActions prop which renders actions on the top right of the card
  The renderActions can have either UserModel or ClientModel as args if at least one action depends on the data inside of the card
  Or it can have no actions at all if all the logic can be handled outside
*/

type PartyData = UserModel | ClientModel;

type Props = {
  partyType: 'sender' | 'receiver';
  partyData: PartyData | undefined;
  insideForm?: boolean;
  renderActions?: (partyData: PartyData | undefined) => ReactNode;
  isInvalid?: boolean;
  errorMessage?: string;
};

const InvoicePartyCard = ({
  partyType,
  partyData,
  insideForm = false,
  renderActions,
  isInvalid,
  errorMessage
}: Props) => {
  const smallText = partyType === 'receiver' ? 'To:' : 'From:';

  if (!partyData)
    return (
      <div className="w-full">
        <Card className={`min-h-36 p-2 ${isInvalid && 'bg-[#F3126040]'}`}>
          <CardHeader>
            {insideForm && (
              <small className="text-default-500">{smallText}</small>
            )}
          </CardHeader>
          {renderActions?.(partyData)}
        </Card>
        {isInvalid && (
          <Chip variant="light" size="sm" color="danger">
            {errorMessage}
          </Chip>
        )}
      </div>
    );

  const { address, businessNumber, businessType, name, email } = partyData;

  return (
    <div className="w-full">
      <Card className="relative p-2">
        <CardHeader className="max-w-[80%] flex-col items-start pb-0">
          {renderActions?.(partyData)}
          {insideForm && (
            <small className="text-default-500">{smallText}</small>
          )}
          <h4 className="text-large font-bold uppercase">{name}</h4>
        </CardHeader>
        <CardBody className="overflow-visible py-2">
          <p className="text-tiny font-bold uppercase">
            {businessType} No. {businessNumber}
          </p>
          <small className="text-default-500">{address}</small>
          {email && <small className="text-default-500">{email}</small>}
        </CardBody>
      </Card>
    </div>
  );
};

export default InvoicePartyCard;
