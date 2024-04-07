'use client';

import { Input } from '@nextui-org/react';
import { useState } from 'react';

import useGetUser from '@/hooks/useGetUser';

import InvoicePartyCard from './InvoicePartyCard';

const AddNewInvoiceForm = () => {
  const [invoiceData, setInvoiceData] = useState();
  const [receiverData, setReceiverData] = useState();
  const { user } = useGetUser();

  const renderSenderActions = () => {
    return <></>;
  };
  const renderReceiverActions = () => {
    return <></>;
  };

  return (
    <div className='w-full flex flex-col gap-4'>
      <h1>Form</h1>
      <Input />
      <div className='flex gap-4 w-full'>
        {user && (
          <InvoicePartyCard
            insideForm
            partyType='sender'
            partyData={user}
            renderActions={renderSenderActions}
          />
        )}
        <InvoicePartyCard
          insideForm
          partyType='receiver'
          partyData={receiverData}
          renderActions={renderReceiverActions}
        />
      </div>
    </div>
  );
};

export default AddNewInvoiceForm;
