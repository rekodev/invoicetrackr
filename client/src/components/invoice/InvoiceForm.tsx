'use client';

import {
  Button,
  Card,
  Chip,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { statusOptions } from '@/constants/table';
import { UiState } from '@/constants/uiState';
import useInvoiceFormSubmissionHandler from '@/hooks/invoice/useInvoiceFormSubmissionHandler';
import useGetUser from '@/hooks/user/useGetUser';
import { ClientModel } from '@/types/models/client';
import { InvoiceModel } from '@/types/models/invoice';
import { formatDate } from '@/utils/formatDate';

import InvoiceFormReceiverModal from './InvoiceFormReceiverModal';
import InvoicePartyCard from './InvoicePartyCard';
import InvoiceServicesTable from './InvoiceServicesTable';
import PencilIcon from '../icons/PencilIcon';
import { PlusIcon } from '../icons/PlusIcon';
import ErrorAlert from '../ui/ErrorAlert';
import Loader from '../ui/Loader';

type Props = {
  invoiceData?: InvoiceModel;
};

const InvoiceForm = ({ invoiceData }: Props) => {
  const { user, isUserLoading, userError } = useGetUser();
  const methods = useForm<InvoiceModel>({ defaultValues: invoiceData });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    clearErrors,
  } = methods;

  const [receiverData, setReceiverData] = useState<ClientModel | undefined>();
  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [isReceiverModalOpen, setIsReceiverModalOpen] = useState(false);

  const { onSubmit, redirectToInvoicesPage } = useInvoiceFormSubmissionHandler({
    invoiceData,
    user,
    receiverData,
    setUiState,
    setSubmissionMessage,
    setError,
  });

  useEffect(() => {
    if (!invoiceData) return;

    setReceiverData(invoiceData.receiver);
  }, [invoiceData]);

  const handleOpenReceiverModal = () => {
    setIsReceiverModalOpen(true);
  };

  const handleCloseReceiverModal = () => {
    setIsReceiverModalOpen(false);
  };

  const handleSelectReceiver = (receiver: ClientModel) => {
    setReceiverData(receiver);
    setIsReceiverModalOpen(false);
    clearErrors('receiver');
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
      <InvoicePartyCard insideForm partyType='sender' partyData={user} />
      <InvoicePartyCard
        insideForm
        partyType='receiver'
        partyData={receiverData}
        renderActions={renderReceiverActions}
        isInvalid={!!errors.receiver}
        errorMessage={errors.receiver?.message}
      />
    </div>
  );

  const renderInvoiceServices = () => (
    <div className='flex gap-4 flex-col col-span-1 md:col-span-2 lg:col-span-4'>
      <h4>Services</h4>
      <InvoiceServicesTable
        invoiceServices={invoiceData?.services}
        isInvalid={!!errors.services}
        errorMessage={errors.services?.message}
      />
    </div>
  );

  const renderSubmissionMessageAndActions = () => (
    <div className='col-span-full flex w-full items-center gap-5 justify-between overflow-x-hidden'>
      {submissionMessage && (
        <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
          {submissionMessage}
        </Chip>
      )}
      <div className='flex gap-1 justify-end w-full'>
        <Button color='danger' variant='light' onPress={redirectToInvoicesPage}>
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

  if (isUserLoading) return <Loader />;

  if (userError) return <ErrorAlert />;

  return (
    <>
      <FormProvider {...methods}>
        <Card className='p-8 border border-neutral-800 bg-transparent'>
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
              defaultValue={invoiceData?.invoiceId || ''}
              isInvalid={!!errors.invoiceId}
              errorMessage={errors.invoiceId?.message}
            />
            <Select
              aria-label='Status'
              {...register('status')}
              label='Status'
              placeholder='Select status'
              defaultSelectedKeys={
                invoiceData?.status ? [`${invoiceData.status}`] : undefined
              }
              isInvalid={!!errors.status}
              errorMessage={errors.status?.message}
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
              defaultValue={
                invoiceData?.date ? formatDate(invoiceData.date) : ''
              }
              errorMessage={errors.date?.message}
              isInvalid={!!errors.date}
            />
            <Input
              aria-label='Due Date'
              {...register('dueDate')}
              type='date'
              label='Due Date'
              defaultValue={
                invoiceData?.dueDate ? formatDate(invoiceData.dueDate) : ''
              }
              isInvalid={!!errors.dueDate}
              errorMessage={errors.dueDate?.message}
            />
            {renderSenderAndReceiverCards()}
            {renderInvoiceServices()}
            {renderSubmissionMessageAndActions()}
          </form>
        </Card>
      </FormProvider>

      <InvoiceFormReceiverModal
        isOpen={isReceiverModalOpen}
        onClose={handleCloseReceiverModal}
        onReceiverSelect={handleSelectReceiver}
      />
    </>
  );
};

export default InvoiceForm;
