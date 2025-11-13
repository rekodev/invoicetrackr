'use client';

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { ReactNode } from 'react';

import { ClientBody } from '@invoicetrackr/types';
import { User } from '@invoicetrackr/types';

type PartyData = User | ClientBody;

type Props = {
  partyType: 'sender' | 'receiver';
  partyData: PartyData | undefined;
  insideForm?: boolean;
  renderActions?: (_partyData: PartyData | undefined) => ReactNode;
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
      <Card className="border-default-200 relative border p-2">
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
