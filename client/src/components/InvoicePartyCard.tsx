import { Card, CardBody, CardHeader } from '@nextui-org/react';

import {
  InvoicePartyBusinessType,
  InvoicePartyType,
} from '@/types/models/invoice';

type Props = {
  address: string;
  businessNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  type: InvoicePartyType;
  businessType: InvoicePartyBusinessType;
  insideForm?: boolean;
};

const InvoicePartyCard = ({
  address,
  businessNumber,
  firstName,
  lastName,
  type,
  businessType,
  email,
  insideForm = false,
}: Props) => {
  const smallText = type === 'receiver' ? 'From:' : 'To:';

  return (
    <Card className='py-4'>
      <CardHeader className='pb-0 pt-2  flex-col items-start'>
        {insideForm && <small className='text-default-500'>{smallText}</small>}
        <h4 className='font-bold text-large'>
          {firstName} {lastName}
        </h4>
      </CardHeader>
      <CardBody className='overflow-visible py-2'>
        <p className='text-tiny uppercase font-bold'>
          {businessType} No. {businessNumber}
        </p>
        <small className='text-default-500'>{address}</small>
        {email && <small className='text-default-500'>{email}</small>}
      </CardBody>
    </Card>
  );
};

export default InvoicePartyCard;
