'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useForm } from 'react-hook-form';

import { CLIENT_BUSINESS_TYPES } from '@/constants/client';
import { UserModel } from '@/types/models/user';
import { capitalize } from '@/utils';

type Props = {
  user: UserModel | undefined;
};

const PersonalInformationForm = ({ user }: Props) => {
  const { register, handleSubmit, formState } = useForm<UserModel>({
    defaultValues: user,
  });

  const onSubmit = () => {};

  return (
    <Card className='p-3 w-full'>
      <CardBody className=''>
        <form
          aria-label='Personal Information Form'
          onSubmit={handleSubmit(onSubmit)}
          className='grid grid-cols-1 gap-4 sm:grid-cols-2'
        >
          <Input
            {...register('name')}
            label='Name'
            defaultValue={user?.name || ''}
          />
          <Select
            {...register('businessType')}
            label='Business Type'
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
            defaultValue={user?.businessNumber || ''}
          />
          <Input
            {...register('address')}
            label='Address'
            defaultValue={user?.address || ''}
          />
          <Input
            {...register('email')}
            label='Email'
            defaultValue={user?.email || ''}
          />
        </form>
      </CardBody>
      <CardFooter className='justify-end'>
        <Button isDisabled={!formState.isDirty} color='secondary'>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalInformationForm;
