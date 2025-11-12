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
  addToast
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { updateUserAction } from '@/lib/actions/user';
import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { UserModel } from '@/lib/types/models/user';
import { capitalize } from '@/lib/utils';

import SignaturePad from '../signature-pad';

type Props = {
  defaultValues?: Partial<UserModel> | undefined;
  onSuccess?: () => void;
};

// TODO: Improve form and add validation

const PersonalInformationForm = ({ defaultValues, onSuccess }: Props) => {
  const t = useTranslations('profile.personal_information.form');
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
  const [isPending, startTransition] = useTransition();

  const onSubmit: SubmitHandler<UserModel> = async (data) =>
    startTransition(async () => {
      if (!defaultValues?.id) return;

      const response = await updateUserAction({
        user: data,
        signature: formSignature || defaultValues.signature
      });

      addToast({
        title: response.message,
        color: response.ok ? 'success' : 'danger'
      });

      if (!response?.ok) {
        if (response.validationErrors) {
          Object.keys(response.validationErrors).forEach((key) => {
            setError(key as keyof UserModel, {
              message: response.validationErrors!.key
            });
          });
        }

        return;
      }

      onSuccess?.();
    });

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
            label={t('email')}
            placeholder={t('email_placeholder')}
            labelPlacement="outside"
            variant="faded"
          />
          <Input
            {...register('name')}
            label={t('name')}
            placeholder={t('name_placeholder')}
            labelPlacement="outside"
            variant="faded"
          />
          <Select
            {...register('businessType')}
            label={t('business_type')}
            placeholder={t('business_type_placeholder')}
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
            label={t('business_number')}
            placeholder={t('business_number_placeholder')}
            labelPlacement="outside"
            variant="faded"
          />
          <Input
            {...register('address')}
            label={t('address')}
            placeholder={t('address_placeholder')}
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
        <CardFooter className="flex w-full flex-col p-6">
          <Button
            isDisabled={!isDirty && !Boolean(formSignature)}
            type="submit"
            isLoading={isPending}
            color="secondary"
            className="self-end"
          >
            {t('save_changes')}
          </Button>
        </CardFooter>
      </>
    );
  };

  return (
    <Card
      as="form"
      aria-label={t('a11y.form_label')}
      onSubmit={handleSubmit(onSubmit)}
      className="dark:border-default-100 w-full bg-transparent dark:border"
      encType="multipart/form-data"
    >
      <CardHeader className="p-4 px-6">{t('title')}</CardHeader>
      <Divider />
      {renderCardBodyAndFooter()}
    </Card>
  );
};

export default PersonalInformationForm;
