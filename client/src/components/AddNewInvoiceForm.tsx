'use client';

import { Button, Input, Spinner } from '@nextui-org/react';
import { useState } from 'react';

import useGetUser from '@/hooks/useGetUser';
import { ClientModel } from '@/types/models/client';

import InvoiceFormReceiverModal from './InvoiceFormReceiverModal';
import InvoicePartyCard from './InvoicePartyCard';
import PencilIcon from '../components/icons/PencilIcon';
import { PlusIcon } from '../components/icons/PlusIcon';

const AddNewInvoiceForm = () => {
  const [invoiceData, setInvoiceData] = useState();
  const [receiverData, setReceiverData] = useState<ClientModel | undefined>();
  const { user, isUserLoading } = useGetUser();

  const [isReceiverModalOpen, setIsReceiverModalOpen] = useState(false);

  const handleOpenReceiverModal = () => {
    setIsReceiverModalOpen(true);
  };

  const handleCloseReceiverModal = () => {
    setIsReceiverModalOpen(false);
  };

  const handleSelectReceiver = (receiver: ClientModel) => {
    setReceiverData(receiver);
    setIsReceiverModalOpen(false);
  };

  const renderReceiverActions = () => (
    <div className='absolute right-2 top-2 flex gap-1.5 z-10'>
      {receiverData ? (
        <Button
          variant='faded'
          className='min-w-unit-10 w-unit-26 h-unit-8 cursor-pointer'
          onPress={handleOpenReceiverModal}
        >
          <PencilIcon width={4} height={4} />
          Change
        </Button>
      ) : (
        <Button
          variant='faded'
          className='min-w-unit-10 w-22 h-unit-8 cursor-pointer'
          onPress={handleOpenReceiverModal}
        >
          <PlusIcon width={4} height={4} />
          Add
        </Button>
      )}
    </div>
  );

  if (isUserLoading)
    return (
      <div className='w-full flex items-center justify-center pt-8'>
        <Spinner className='m-auto' color='secondary' />
      </div>
    );

  return (
    <>
      <div className='w-full flex flex-col gap-4'>
        <Input />
        <div className='flex gap-4 w-full'>
          {user && (
            <InvoicePartyCard insideForm partyType='sender' partyData={user} />
          )}
          <InvoicePartyCard
            insideForm
            partyType='receiver'
            partyData={receiverData}
            renderActions={renderReceiverActions}
          />
        </div>
      </div>

      <InvoiceFormReceiverModal
        isOpen={isReceiverModalOpen}
        onClose={handleCloseReceiverModal}
        onReceiverSelect={handleSelectReceiver}
      />
    </>
  );
};

export default AddNewInvoiceForm;
