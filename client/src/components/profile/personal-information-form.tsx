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
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { User } from '@invoicetrackr/types';
import { capitalize } from '@/lib/utils';
import { updateUserAction } from '@/lib/actions/user';

import SignaturePad from '../signature-pad';

type Props = {
  defaultValues?: Partial<User> | undefined;
  onSuccess?: () => void;
};

const PersonalInformationForm = ({ defaultValues, onSuccess }: Props) => {
  const t = useTranslations('profile.personal_information.form');
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    reset,
    setError,
    getValues
  } = useForm<User>({
    defaultValues
  });
  const [formSignature, setFormSignature] = useState<
    File | string | undefined
  >();

  const onSubmit: SubmitHandler<User> = async (data) => {
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
        Object.entries(response.validationErrors).forEach(([key, message]) => {
          setError(key as keyof User, {
            message
          });
        });
      }

      return;
    }

    reset(data);
    onSuccess?.();
  };

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
            isInvalid={Boolean(errors.email)}
            errorMessage={errors.email?.message}
          />
          <Input
            {...register('name')}
            label={t('name')}
            placeholder={t('name_placeholder')}
            labelPlacement="outside"
            variant="faded"
            isInvalid={Boolean(errors.name)}
            errorMessage={errors.name?.message}
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
            isInvalid={Boolean(errors.businessType)}
            errorMessage={errors.businessType?.message}
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
            isInvalid={Boolean(errors.businessNumber)}
            errorMessage={errors.businessNumber?.message}
          />
          {getValues('businessType') === 'business' && (
            <Input
              {...register('vatNumber')}
              label="VAT Number"
              placeholder="Enter VAT number"
              labelPlacement="outside"
              variant="faded"
              isInvalid={Boolean(errors.vatNumber)}
              errorMessage={errors.vatNumber?.message}
            />
          )}
          <Input
            {...register('address')}
            label={t('address')}
            placeholder={t('address_placeholder')}
            labelPlacement="outside"
            variant="faded"
            isInvalid={Boolean(errors.address)}
            errorMessage={errors.address?.message}
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
            isLoading={isSubmitting}
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
      <CardHeader
        data-testid="personal-information-form-heading"
        className="p-4 px-6"
      >
        {t('title')}
      </CardHeader>
      <Divider />
      {renderCardBodyAndFooter()}
    </Card>
  );
};

export default PersonalInformationForm;
