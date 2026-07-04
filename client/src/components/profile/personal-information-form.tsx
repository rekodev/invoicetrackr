'use client';

import {
  Alert,
  Button,
  Card,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  Separator,
  TextField,
  cn,
  toast
} from '@heroui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import {
  resendVerificationEmailAction,
  updateUserAction
} from '@/lib/actions/user';
import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';
import { User } from '@invoicetrackr/types';
import { capitalize } from '@/lib/utils';

import AuthCardHeader from '../auth/auth-card-header';
import SignaturePad from '../signature-pad';

type Props = {
  cardHeaderDescription?: string;
  cardHeaderTitle?: string;
  defaultValues?: Partial<User> | undefined;
  headerContent?: ReactNode;
  hideEmailVerificationBanner?: boolean;
  onSuccess?: () => void | Promise<void>;
};

const PersonalInformationForm = ({
  cardHeaderDescription,
  cardHeaderTitle,
  defaultValues,
  headerContent,
  hideEmailVerificationBanner = false,
  onSuccess
}: Props) => {
  const t = useTranslations('profile.personal_information.form');

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    reset,
    setError,
    watch
  } = useForm<User>({
    defaultValues
  });

  const [formSignature, setFormSignature] = useState<
    File | string | undefined
  >();
  const [isResendingVerificationEmail, setIsResendingVerificationEmail] =
    useState(false);
  const isOnboardingCard = Boolean(cardHeaderTitle && cardHeaderDescription);

  const emailVerifiedAt = defaultValues?.emailVerifiedAt;
  const isEmailVerified = Boolean(emailVerifiedAt);
  const verifiedDate = emailVerifiedAt
    ? new Date(emailVerifiedAt).toLocaleDateString(
        defaultValues?.language || 'en'
      )
    : null;

  const businessType = watch('businessType');

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit: SubmitHandler<User> = async (data) => {
    if (!defaultValues?.id) return;

    const response = await updateUserAction({
      user: data,
      signature: formSignature || defaultValues.signature
    });

    toast(response.message, { variant: response.ok ? 'success' : 'danger' });

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
    await onSuccess?.();
  };

  const handleResendVerificationEmail = async () => {
    if (!defaultValues?.id) return;

    setIsResendingVerificationEmail(true);
    try {
      const response = await resendVerificationEmailAction({
        userId: Number(defaultValues.id)
      });

      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });
    } finally {
      setIsResendingVerificationEmail(false);
    }
  };

  const renderTextField = ({
    name,
    label,
    placeholder,
    isDisabled = false,
    isReadOnly = false
  }: {
    name: keyof User;
    label: string;
    placeholder: string;
    isDisabled?: boolean;
    isReadOnly?: boolean;
  }) => {
    const error = errors[name];

    return (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <TextField
            variant="secondary"
            isDisabled={isDisabled}
            isInvalid={Boolean(error)}
            className="w-full"
          >
            <Label>{label}</Label>

            <Input
              name={field.name}
              value={String(field.value ?? '')}
              readOnly={isReadOnly}
              placeholder={placeholder}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />

            {error?.message ? <FieldError>{error.message}</FieldError> : null}
          </TextField>
        )}
      />
    );
  };

  const renderEmailVerificationBanner = () => (
    <Alert
      status={isEmailVerified ? 'success' : 'warning'}
      className="bg-surface-secondary border md:col-span-2"
    >
      <Alert.Indicator>
        {isEmailVerified ? (
          <CheckCircleIcon className="h-5 w-5" />
        ) : (
          <ExclamationCircleIcon className="h-5 w-5" />
        )}
      </Alert.Indicator>

      <Alert.Content>
        <Alert.Title>{t('email_verification.title')}</Alert.Title>

        <Alert.Description>
          {isEmailVerified
            ? t('email_verification.verified_description')
            : t('email_verification.unverified_description')}
        </Alert.Description>
      </Alert.Content>
      {isEmailVerified && verifiedDate ? (
        <span className="text-muted self-start whitespace-nowrap text-right text-xs">
          {t('email_verification.sent_at', { date: verifiedDate })}
        </span>
      ) : !isEmailVerified ? (
        <Button
          className="self-center"
          size="sm"
          type="button"
          variant="secondary"
          isPending={isResendingVerificationEmail}
          onPress={handleResendVerificationEmail}
        >
          {t('email_verification.resend')}
        </Button>
      ) : null}
    </Alert>
  );

  const renderCardBodyAndFooter = () => {
    return (
      <>
        <Card.Content
          className={cn(
            'grid grid-cols-1 gap-4 p-6',
            !isOnboardingCard && 'md:grid-cols-2'
          )}
        >
          {!hideEmailVerificationBanner && renderEmailVerificationBanner()}
          {renderTextField({
            name: 'email',
            label: t('email'),
            placeholder: t('email_placeholder'),
            isDisabled: true
          })}

          {renderTextField({
            name: 'name',
            label: t('name'),
            placeholder: t('name_placeholder')
          })}

          <Controller
            control={control}
            name="businessType"
            render={({ field }) => (
              <Select
                className="w-full"
                placeholder={t('business_type_placeholder')}
                variant="secondary"
                isInvalid={Boolean(errors.businessType)}
                value={field.value}
                onChange={field.onChange}
              >
                <Label>{t('business_type')}</Label>

                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>

                <Select.Popover>
                  <ListBox>
                    {CLIENT_BUSINESS_TYPES.map((type) => {
                      const label = capitalize(type);

                      return (
                        <ListBox.Item key={type} id={type} textValue={label}>
                          {label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      );
                    })}
                  </ListBox>
                </Select.Popover>

                {errors.businessType?.message ? (
                  <FieldError>{errors.businessType.message}</FieldError>
                ) : null}
              </Select>
            )}
          />

          {renderTextField({
            name: 'businessNumber',
            label: t('business_number'),
            placeholder: t('business_number_placeholder')
          })}

          {businessType === 'business' && (
            <Controller
              control={control}
              name="vatNumber"
              render={({ field }) => (
                <TextField
                  variant="secondary"
                  isInvalid={Boolean(errors.vatNumber)}
                  className="w-full"
                >
                  <Label>VAT Number</Label>

                  <Input
                    name={field.name}
                    value={String(field.value ?? '')}
                    placeholder="Enter VAT number"
                    onBlur={field.onBlur}
                    onChange={field.onChange}
                  />

                  {errors.vatNumber?.message ? (
                    <FieldError>{errors.vatNumber.message}</FieldError>
                  ) : null}
                </TextField>
              )}
            />
          )}

          {renderTextField({
            name: 'address',
            label: t('address'),
            placeholder: t('address_placeholder')
          })}

          <div className="mt-[-0.25rem] flex flex-col gap-2">
            <label className="self-start text-sm">Signature</label>

            <SignaturePad
              signature={formSignature || defaultValues?.signature}
              onSignatureChange={setFormSignature}
            />
          </div>
        </Card.Content>

        <Card.Footer className="flex w-full flex-col px-6 py-4">
          <Button
            isDisabled={isSubmitting || (!isDirty && !Boolean(formSignature))}
            type="submit"
            className={cn(isOnboardingCard ? 'w-full' : 'w-full sm:w-auto sm:self-end')}
          >
            {t('save_changes')}
          </Button>
        </Card.Footer>
      </>
    );
  };

  return (
    <form
      aria-label={t('a11y.form_label')}
      onSubmit={handleSubmit(onSubmit)}
      encType="multipart/form-data"
      className="w-full"
    >
      <Card className="w-full border">
        {isOnboardingCard ? (
          <AuthCardHeader
            title={cardHeaderTitle!}
            description={cardHeaderDescription!}
          >
            {headerContent}
          </AuthCardHeader>
        ) : (
          <Card.Header className="flex-col items-start gap-4 px-6 py-4">
            <Card.Title className="text-2xl">{t('title')}</Card.Title>
            {headerContent}
          </Card.Header>
        )}
        <Separator />
        {renderCardBodyAndFooter()}
      </Card>
    </form>
  );
};

export default PersonalInformationForm;
