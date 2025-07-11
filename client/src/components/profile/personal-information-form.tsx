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
  SelectItem
} from '@heroui/react';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { updateUserAction } from '@/lib/actions/user';
import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { UiState } from '@/lib/constants/ui-state';
import { UserModel } from '@/lib/types/models/user';
import { capitalize } from '@/lib/utils';

import SignaturePad from '../signature-pad';
import GeneralFormError from '../ui/general-form-error';

type Props = {
  defaultValues?: Partial<UserModel> | undefined;
  onSuccess?: () => void;
};

// TODO: Improve form and add validation

const PersonalInformationForm = ({ defaultValues, onSuccess }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
    setError
  } = useForm<UserModel>({
    defaultValues
  });
  const [formSignature, setFormSignature] = useState<
    File | string | undefined
  >();
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);

  const onSubmit: SubmitHandler<UserModel> = async (data) => {
    if (!defaultValues?.id) return;

    setSubmissionMessage('');
    setUiState(UiState.Pending);

    const response = await updateUserAction({
      user: data,
      signature: formSignature || defaultValues.signature
    });

    setSubmissionMessage(response?.message || '');

    if (!response?.ok) {
      setUiState(UiState.Failure);

      if (response.validationErrors) {
        Object.keys(response.validationErrors).forEach((key) => {
          setError(key as keyof UserModel, {
            message: response.validationErrors!.key
          });
        });
      }

      return;
    }

    setUiState(UiState.Success);
    onSuccess?.();
  };

  // When form is updated and user is re-fetched, reset the form to match the new user data
  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const renderCardBodyAndFooter = () => {
    return (
      <>
        <CardBody className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
          <Input
            isDisabled
            {...register('email')}
            label="Email"
            labelPlacement="outside"
            variant="faded"
          />
          <Input
            {...register('name')}
            label="Name"
            labelPlacement="outside"
            variant="faded"
          />
          <Select
            {...register('businessType')}
            label="Business Type"
            labelPlacement="outside"
            variant="faded"
            defaultSelectedKeys={
              defaultValues?.businessType
                ? [`${defaultValues?.businessType}`]
                : undefined
            }
          >
            {CLIENT_BUSINESS_TYPES.map((type) => (
              <SelectItem key={type}>{capitalize(type)}</SelectItem>
            ))}
          </Select>
          <Input
            {...register('businessNumber')}
            label="Business Number"
            labelPlacement="outside"
            variant="faded"
          />
          <Input
            {...register('address')}
            label="Address"
            labelPlacement="outside"
            variant="faded"
          />
          <div className="mt-[-0.25rem] flex flex-col gap-2">
            <label className="self-start text-sm">Signature</label>
            <SignaturePad
              signature={formSignature || defaultValues?.signature}
              onSignatureChange={setFormSignature}
            />
          </div>
        </CardBody>
        <CardFooter className="w-full justify-between p-6">
          <GeneralFormError
            submissionMessage={submissionMessage}
            uiState={uiState}
          />
          <hr />
          <Button
            isDisabled={!isDirty && !Boolean(formSignature)}
            type="submit"
            isLoading={uiState === UiState.Pending}
            color="secondary"
            className="self-end"
          >
            Save
          </Button>
        </CardFooter>
      </>
    );
  };

  return (
    <Card
      as="form"
      aria-label="Personal Information Form"
      onSubmit={handleSubmit(onSubmit)}
      className="w-full bg-transparent dark:border dark:border-default-100"
      encType="multipart/form-data"
    >
      <CardHeader className="p-4 px-6">Personal Information</CardHeader>
      <Divider />
      {renderCardBodyAndFooter()}
    </Card>
  );
};

export default PersonalInformationForm;
