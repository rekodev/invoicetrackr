'use client';

import { Button, Input, Select, SelectItem, Spinner } from '@nextui-org/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { statusOptions } from '@/constants/table';
import useGetUser from '@/hooks/useGetUser';
import { ClientModel } from '@/types/models/client';

import InvoiceFormReceiverModal from './InvoiceFormReceiverModal';
import InvoicePartyCard from './InvoicePartyCard';
import InvoiceServicesTable from './InvoiceServicesTable';
import PencilIcon from '../components/icons/PencilIcon';
import { PlusIcon } from '../components/icons/PlusIcon';

const senderSchema = z.object({
  name: z.string(),
  type: z.literal('sender'),
  businessType: z.union([z.literal('individual'), z.literal('business')]),
  businessNumber: z.string(),
  address: z.string(),
  email: z.string(),
});

const receiverSchema = z.object({
  name: z.string(),
  type: z.literal('receiver'),
  businessType: z.union([z.literal('individual'), z.literal('business')]),
  businessNumber: z.string(),
  address: z.string(),
  email: z.string(),
});

const serviceSchema = z.object({
  description: z.string(),
  amount: z.number(),
  quantity: z.number(),
  unit: z.string(),
});

const addNewInvoiceSchema = z.object({
  invoiceId: z.string().regex(new RegExp('^[A-Za-z]{3}(?!000)\\d{3}$')),
  status: z.string(),
  date: z.date(),
  dueDate: z.date(),
  sender: senderSchema,
  receiver: receiverSchema,
  services: z.array(serviceSchema),
  totalAmount: z.number(),
});

type InvoiceFormValues = z.infer<typeof addNewInvoiceSchema>;

const AddNewInvoiceForm = () => {
  const { register } = useForm<InvoiceFormValues>();
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

  const renderSenderAndReceiverCards = () => (
    <div className='col-span-1 flex gap-4 w-full flex-col md:col-span-2 lg:col-span-4 md:flex-row'>
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
  );

  const renderInvoiceServices = () => {
    return (
      <div className='flex gap-4 flex-col col-span-1 md:col-span-2 lg:col-span-4'>
        <h4>Services</h4>
        <InvoiceServicesTable />
      </div>
    );
  };

  if (isUserLoading)
    return (
      <div className='w-full flex items-center justify-center pt-8'>
        <Spinner className='m-auto' color='secondary' />
      </div>
    );

  return (
    <>
      <form className='w-full grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Input
          {...register('invoiceId')}
          label='Invoice ID'
          placeholder='e.g., INV001'
        />
        <Select
          {...register('status')}
          label='Status'
          placeholder='Select status'
        >
          {statusOptions.map((option) => (
            <SelectItem key={option.uid}>{option.name}</SelectItem>
          ))}
        </Select>
        <Input {...register('date')} type='date' label='Date' />
        <Input {...register('dueDate')} type='date' label='Due Date' />
        {renderSenderAndReceiverCards()}
        {renderInvoiceServices()}
      </form>

      <InvoiceFormReceiverModal
        isOpen={isReceiverModalOpen}
        onClose={handleCloseReceiverModal}
        onReceiverSelect={handleSelectReceiver}
      />
    </>
  );
};

export default AddNewInvoiceForm;
