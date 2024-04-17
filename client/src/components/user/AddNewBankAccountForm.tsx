'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
} from '@nextui-org/react';
import { useForm } from 'react-hook-form';

import {
  BankingInformation,
  bankingInformationSchema,
} from '@/types/models/user';

const SELECTED_BANK_ID = 1;

type Props = {
  onCancel: () => void;
};

const AddNewBankAccountForm = ({ onCancel }: Props) => {
  const { register, handleSubmit } = useForm<BankingInformation>({
    defaultValues: {},
    resolver: zodResolver(bankingInformationSchema),
  });

  const onSubmit = () => {};

  return (
    <Card className='w-full border border-neutral-800 bg-transparent max-h-80'>
      <form
        aria-label='Banking Information Form'
        onSubmit={handleSubmit(onSubmit)}
      >
        <CardHeader className='p-4 px-6'>Banking Information</CardHeader>
        <Divider />
        <CardBody className='p-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <Input
            {...register('bankName')}
            label='Bank Name'
            variant='underlined'
          />
          <Input
            {...register('bankCode')}
            label='Bank Code'
            variant='underlined'
          />
          <Input
            {...register('bankAccountNumber')}
            label='Bank Account Number'
            variant='underlined'
          />
        </CardBody>
        <CardFooter className='justify-end p-6 gap-2'>
          <Button color='danger' variant='light' onPress={onCancel}>
            Cancel
          </Button>
          <Button color='secondary'>Save</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddNewBankAccountForm;
