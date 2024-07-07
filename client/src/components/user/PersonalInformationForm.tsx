'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Input,
  Select,
  SelectItem,
} from '@nextui-org/react';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { updateUser } from '@/api';
import { CLIENT_BUSINESS_TYPES } from '@/constants/client';
import { UiState } from '@/constants/uiState';
import useGetUser from '@/hooks/user/useGetUser';
import { UserModel } from '@/types/models/user';
import { capitalize } from '@/utils';

import SignaturePad from '../SignaturePad';

type Props = {
  user: UserModel | undefined;
};

// TODO: Improve form and add validation

const PersonalInformationForm = ({ user }: Props) => {
  const { mutateUser } = useGetUser();
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<UserModel>({
    defaultValues: user,
  });
  const [formSignature, setFormSignature] = useState<
    File | string | undefined
  >();
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);

  const onSubmit: SubmitHandler<UserModel> = async (data) => {
    if (!user?.id) return;

    setSubmissionMessage('');
    setUiState(UiState.Pending);

    const response = await updateUser(user.id, {
      ...data,
      signature: formSignature || user.signature,
    });
    setSubmissionMessage(response.data.message);

    if ('errors' in response.data) {
      setUiState(UiState.Failure);

      // response.data.errors.forEach((error) => {
      //   setError(error.key, { message: error.value });
      // });

      return;
    }

    setUiState(UiState.Success);
    mutateUser();
  };

  return (
    <Card
      as='form'
      aria-label='Personal Information Form'
      onSubmit={handleSubmit(onSubmit)}
      className='w-full bg-transparent border border-neutral-800'
      encType='multipart/form-data'
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
        <div className='flex flex-col gap-2 mt-[-0.25rem]'>
          <label className='text-sm self-start '>Signature</label>
          <SignaturePad
            signature={formSignature || user?.signature}
            onSignatureChange={setFormSignature}
          />
        </div>
      </CardBody>
      <CardFooter className='justify-between p-6 w-full'>
        {submissionMessage && (
          <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
            {submissionMessage}
          </Chip>
        )}
        <Button
          isDisabled={!isDirty && !Boolean(formSignature)}
          type='submit'
          isLoading={uiState === UiState.Pending}
          color='secondary'
        >
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PersonalInformationForm;
