'use client';

import {
  CameraIcon,
  CheckCircleIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Checkbox,
  cn,
  FieldError,
  Input,
  Label,
  Separator,
  TextField,
  toast,
  Tooltip} from '@heroui/react';
import type { User } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import {
  resendVerificationEmailAction,
  updateUserAction,
  updateUserProfilePictureAction
} from '@/lib/actions/user';

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

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    setValue,
    watch
  } = useForm<User>({
    defaultValues
  });

  const [formSignature, setFormSignature] = useState<
    File | string | undefined
  >();
  const [profilePictureFile, setProfilePictureFile] = useState<File>();
  const [profilePicturePreviewUrl, setProfilePicturePreviewUrl] =
    useState<string>();
  const profilePictureInputRef = useRef<HTMLInputElement>(null);
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
  const isVatPayer = watch('isVatPayer');
  const vatNumber = watch('vatNumber');

  useEffect(() => {
    if (defaultValues) reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(
    () => () => {
      if (profilePicturePreviewUrl)
        URL.revokeObjectURL(profilePicturePreviewUrl);
    },
    [profilePicturePreviewUrl]
  );

  const onSubmit: SubmitHandler<User> = async (data) => {
    if (!defaultValues?.id) return;
    const profileData = {
      ...data,
      businessType: 'individual' as const
    };

    const response = await updateUserAction({
      user: profileData,
      signature: formSignature || defaultValues.signature
    });

    if (!response?.ok) {
      toast(response.message, { variant: 'danger' });

      if (response.validationErrors) {
        Object.entries(response.validationErrors).forEach(([key, message]) => {
          setError(key as keyof User, {
            message
          });
        });
      }

      return;
    }

    if (profilePictureFile) {
      const formData = new FormData();
      formData.append('profilePicture', profilePictureFile);
      const pictureResponse = await updateUserProfilePictureAction({
        userId: Number(defaultValues.id),
        formData
      });

      if (!pictureResponse.ok) {
        toast(pictureResponse.message, { variant: 'danger' });
        return;
      }

      setProfilePictureFile(undefined);
      if (profilePictureInputRef.current)
        profilePictureInputRef.current.value = '';
    }

    toast(response.message, { variant: 'success' });

    reset(profileData);
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
        <Alert.Title>
          {isEmailVerified
            ? t('email_verification.confirmed')
            : t('email_verification.title')}
        </Alert.Title>

        <Alert.Description>
          {isEmailVerified
            ? t('email_verification.confirmed_description')
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

  const renderProfilePictureInput = () => (
    <Card className="flex min-h-[88px] flex-col gap-4 border p-4 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar size="lg">
          <Avatar.Image
            src={profilePicturePreviewUrl || defaultValues?.profilePictureUrl}
            alt={defaultValues?.name || defaultValues?.email || 'User'}
          />
          <Avatar.Fallback>
            {(defaultValues?.name || defaultValues?.email || 'U')
              .slice(0, 2)
              .toUpperCase()}
          </Avatar.Fallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {defaultValues?.name || 'User'}
          </p>
          <p className="text-muted truncate text-sm">{defaultValues?.email}</p>
        </div>
      </div>
      {profilePictureFile ? (
        <Card
          variant="secondary"
          className="flex w-full flex-row items-center gap-3 border p-2 pl-4 sm:w-auto sm:min-w-64"
        >
          <DocumentIcon
            className="text-muted size-5 shrink-0"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {profilePictureFile.name}
            </p>
            <p className="text-muted text-xs">
              {t('profile_picture_ready', {
                size: formatFileSize(profilePictureFile.size)
              })}
            </p>
          </div>
          <Button
            type="button"
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={t('a11y.dismiss_profile_picture')}
            onPress={() => {
              setProfilePictureFile(undefined);
              setProfilePicturePreviewUrl(undefined);
              if (profilePictureInputRef.current)
                profilePictureInputRef.current.value = '';
            }}
          >
            <XMarkIcon className="size-4" aria-hidden="true" />
          </Button>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onPress={() => profilePictureInputRef.current?.click()}
        >
          <CameraIcon className="size-4" aria-hidden="true" />
          {t('upload_profile_picture')}
        </Button>
      )}
      <input
        ref={profilePictureInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        aria-label={t('a11y.profile_picture_input')}
        onChange={(event) => {
          const file = event.target.files?.[0];
          setProfilePictureFile(file);
          setProfilePicturePreviewUrl(
            file ? URL.createObjectURL(file) : undefined
          );
        }}
      />
    </Card>
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
          {renderProfilePictureInput()}
          {renderTextField({
            name: 'email',
            label: t('email'),
            placeholder: t('email_placeholder'),
            isDisabled: true
          })}

          {renderTextField({
            name: 'invoiceEmail',
            label: t('invoice_email'),
            placeholder: t('email_placeholder')
          })}

          {renderTextField({
            name: 'name',
            label: t('name'),
            placeholder: t('name_placeholder')
          })}

          {renderTextField({
            name: 'businessNumber',
            label: t('business_number'),
            placeholder: t('business_number_placeholder')
          })}

          {renderTextField({
            name: 'phone',
            label: t('phone'),
            placeholder: t('phone_placeholder')
          })}

          <Controller
            control={control}
            name="isVatPayer"
            render={({ field }) => (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <Label>{t('is_vat_payer')}</Label>
                  <Tooltip delay={0}>
                    <Tooltip.Trigger>
                      <button
                        type="button"
                        aria-label={t('is_vat_payer_description')}
                        className="text-muted hover:text-foreground focus-visible:ring-accent rounded-full outline-none focus-visible:ring-2"
                      >
                        <InformationCircleIcon className="size-4" />
                      </button>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      {t('is_vat_payer_description')}
                    </Tooltip.Content>
                  </Tooltip>
                </div>
                <Checkbox
                  variant="secondary"
                  isSelected={Boolean(field.value)}
                  onChange={(isSelected) => {
                    field.onChange(isSelected);

                    if (!isSelected) {
                      setValue('vatNumber', null, {
                        shouldDirty: true,
                        shouldValidate: true
                      });
                    }
                  }}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    <Label>{t('is_vat_payer_option')}</Label>
                  </Checkbox.Content>
                </Checkbox>
              </div>
            )}
          />

          {(isVatPayer || vatNumber) && (
            <Controller
              control={control}
              name="vatNumber"
              render={({ field }) => (
                <TextField
                  variant="secondary"
                  isInvalid={Boolean(errors.vatNumber)}
                  className="w-full"
                >
                  <Label>{t('vat_number')}</Label>

                  <Input
                    name={field.name}
                    value={String(field.value ?? '')}
                    placeholder={t('vat_number_placeholder')}
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
            <label className="self-start text-sm">{t('signature')}</label>

            <SignaturePad
              signature={formSignature || defaultValues?.signature}
              onSignatureChange={setFormSignature}
            />
          </div>
        </Card.Content>

        <Card.Footer className="flex w-full flex-col px-6 py-4">
          <Button
            isDisabled={
              isSubmitting ||
              (!isDirty && !Boolean(formSignature) && !profilePictureFile)
            }
            type="submit"
            className={cn(
              isOnboardingCard ? 'w-full' : 'w-full sm:w-auto sm:self-end'
            )}
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
        {isOnboardingCard && (
          <>
            <AuthCardHeader
              title={cardHeaderTitle!}
              description={cardHeaderDescription!}
            >
              {headerContent}
            </AuthCardHeader>

            <Separator />
          </>
        )}
        {renderCardBodyAndFooter()}
      </Card>
    </form>
  );
};

export default PersonalInformationForm;
