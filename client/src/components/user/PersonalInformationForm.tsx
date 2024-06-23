'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useForm } from 'react-hook-form';

import { CLIENT_BUSINESS_TYPES } from '@/constants/client';
import { UserModel } from '@/types/models/user';
import { capitalize } from '@/utils';

import SignaturePad from '../SignaturePad';

type Props = {
  user: UserModel | undefined;
};

const PersonalInformationForm = ({ user }: Props) => {
  const { register, handleSubmit, formState } = useForm<UserModel>({
    defaultValues: user,
  });

  const onSubmit = () => {};

  return (
    <Card
      as='form'
      aria-label='Personal Information Form'
      onSubmit={handleSubmit(onSubmit)}
      className='w-full bg-transparent border border-neutral-800'
    >
      <CardHeader className='p-4 px-6'>Personal Information</CardHeader>
      <Divider />
      <CardBody className='p-6 grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <Input
          {...register('name')}
          label='Name'
          labelPlacement='outside'
          variant='faded'
          defaultValue={user?.name || ''}
        />
        <Select
          {...register('businessType')}
          label='Business Type'
          labelPlacement='outside'
          variant='faded'
          defaultSelectedKeys={
            user?.businessType ? [`${user?.businessType}`] : undefined
          }
        >
          {CLIENT_BUSINESS_TYPES.map((type) => (
            <SelectItem key={type}>{capitalize(type)}</SelectItem>
          ))}
        </Select>
        <Input
          {...register('businessNumber')}
          label='Business Number'
          labelPlacement='outside'
          variant='faded'
          defaultValue={user?.businessNumber || ''}
        />
        <Input
          {...register('address')}
          label='Address'
          labelPlacement='outside'
          variant='faded'
          defaultValue={user?.address || ''}
        />
        <Input
          {...register('email')}
          label='Email'
          labelPlacement='outside'
          variant='faded'
          defaultValue={user?.email || ''}
        />
        <SignaturePad />
      </CardBody>
      <CardFooter className='justify-end p-6'>
        <Button isDisabled={!formState.isDirty} color='secondary'>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalInformationForm;
