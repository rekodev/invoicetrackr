'use client';

import {
  Button,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { addInvoice } from '@/api';
import { INVOICES_PAGE } from '@/constants/pages';
import { statusOptions } from '@/constants/table';
import { UiState } from '@/constants/uiState';
import useGetInvoices from '@/hooks/useGetInvoices';
import useGetUser from '@/hooks/useGetUser';
import { ClientModel } from '@/types/models/client';

import InvoiceFormReceiverModal from './InvoiceFormReceiverModal';
import InvoicePartyCard from './InvoicePartyCard';
import InvoiceServicesTable from './InvoiceServicesTable';
import PencilIcon from '../components/icons/PencilIcon';
import { PlusIcon } from '../components/icons/PlusIcon';

const senderSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.literal('sender'),
  businessType: z.union([z.literal('individual'), z.literal('business')]),
  businessNumber: z.string(),
  address: z.string(),
  email: z.string(),
});

const receiverSchema = z.object({
  id: z.number(),
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
  date: z.string(),
  dueDate: z.string(),
  sender: senderSchema,
  receiver: receiverSchema,
  services: z.array(serviceSchema),
  totalAmount: z.number(),
});

type ServiceType = z.infer<typeof serviceSchema>;

export type InvoiceFormData = z.infer<typeof addNewInvoiceSchema>;

const calculateServiceTotal = (services: Array<ServiceType>) => {
  return services.reduce(
    (acc, currentValue) => acc + Number(currentValue.amount),
    0
  );
};

const AddNewInvoiceForm = () => {
  const router = useRouter();
  const methods = useForm<InvoiceFormData>();
  const { register, handleSubmit } = methods;
  const { mutateInvoices } = useGetInvoices();
  const { user, isUserLoading } = useGetUser();

  const [receiverData, setReceiverData] = useState<ClientModel | undefined>();
  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');
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

  const onSubmit: SubmitHandler<InvoiceFormData> = async (data) => {
    if (!user || !receiverData) return;

    setSubmissionMessage('');
    const dataWithSenderAndReceiverAndTotal: typeof data = {
      ...data,
      receiver: receiverData,
      sender: user,
      totalAmount: calculateServiceTotal(data.services),
    };

    console.log({ dataWithSenderAndReceiverAndTotal });
    const response = await addInvoice(
      user.id,
      dataWithSenderAndReceiverAndTotal
    );
    setSubmissionMessage(response.data.message);

    if ('error' in response.data) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
    mutateInvoices();
    router.push(INVOICES_PAGE);
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

  const renderSubmissionMessageAndActions = () => (
    <div className='col-span-full flex w-full items-center gap-5 justify-between overflow-x-hidden'>
      {submissionMessage && (
        <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
          {submissionMessage}
        </Chip>
      )}
      <div className='flex gap-1 justify-end w-full'>
        <Button color='danger' variant='light'>
          Cancel
        </Button>
        <Button
          type='submit'
          isLoading={uiState === UiState.Pending}
          color='secondary'
        >
          Save
        </Button>
      </div>
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
      <FormProvider {...methods}>
        <form
          aria-label='Add New Invoice Form'
          className='w-full grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'
          onSubmit={handleSubmit(onSubmit)}
        >
          <Input
            aria-label='Invoice ID'
            {...register('invoiceId')}
            label='Invoice ID'
            placeholder='e.g., INV001'
            defaultValue=''
          />
          <Select
            aria-label='Status'
            {...register('status')}
            label='Status'
            placeholder='Select status'
          >
            {statusOptions.map((option) => (
              <SelectItem key={option.uid}>{option.name}</SelectItem>
            ))}
          </Select>
          <Input
            aria-label='Date'
            {...register('date')}
            type='date'
            label='Date'
            defaultValue=''
          />
          <Input
            aria-label='Due Date'
            {...register('dueDate')}
            type='date'
            label='Due Date'
            defaultValue=''
          />
          {renderSenderAndReceiverCards()}
          {renderInvoiceServices()}
          {renderSubmissionMessageAndActions()}
        </form>
      </FormProvider>

      <InvoiceFormReceiverModal
        isOpen={isReceiverModalOpen}
        onClose={handleCloseReceiverModal}
        onReceiverSelect={handleSelectReceiver}
      />
    </>
  );
};

export default AddNewInvoiceForm;
