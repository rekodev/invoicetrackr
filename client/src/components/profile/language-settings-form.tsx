'use client';

import { LanguageIcon } from '@heroicons/react/24/outline';
import {
  Button,
  FieldError,
  ListBox,
  ListBoxItem,
  Select,
  Separator,
  toast,
  Toolbar
} from '@heroui/react';
import type { User } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import SectionHeading from '@/components/ui/section-heading';
import { updateUserLanguageAction } from '@/lib/actions/user';
import { availableLanguages } from '@/lib/constants/languages';

type LanguageFormModel = { language: string };

type Props = {
  user: User;
};

const LanguageSettingsForm = ({ user }: Props) => {
  const baseT = useTranslations();
  const t = useTranslations('profile.account.language');
  const {
    handleSubmit,
    control,
    formState: { isDirty, errors, isSubmitting },
    setError,
    reset
  } = useForm<LanguageFormModel>({
    defaultValues: { language: user.language }
  });

  const onSubmit: SubmitHandler<LanguageFormModel> = async ({ language }) => {
    const response = await updateUserLanguageAction({
      userId: Number(user.id),
      language
    });

    toast(response.message, {
      variant: response.ok ? 'success' : 'danger'
    });

    if (!response.ok) {
      if (response.validationErrors?.language) {
        setError('language', { message: response.validationErrors.language });
      }

      return;
    }

    reset({ language });
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-heading"
      aria-label={t('title')}
      onSubmit={handleSubmit(onSubmit)}
    >
      <SectionHeading title={t('title')} />
      <Toolbar isAttached aria-label={t('title')} className="w-fit shadow-none">
        <Controller
          control={control}
          name="language"
          render={({ field }) => (
            <Select
              className="w-max"
              variant="secondary"
              aria-label={t('label')}
              value={field.value}
              onChange={field.onChange}
              isInvalid={!!errors.language}
            >
              <Select.Trigger className="w-max items-center gap-actions rounded-full">
                <LanguageIcon className="size-4 shrink-0" />
                <Select.Value className="flex-none" />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {availableLanguages.map((language) => (
                    <ListBoxItem
                      key={language.code}
                      id={language.code}
                      textValue={baseT(language.nameTranslationKey)}
                    >
                      {baseT(language.nameTranslationKey)}
                      <ListBoxItem.Indicator />
                    </ListBoxItem>
                  ))}
                </ListBox>
              </Select.Popover>
              <FieldError>{errors.language?.message}</FieldError>
            </Select>
          )}
        />
        <Separator orientation="vertical" />
        <Button isDisabled={!isDirty} isPending={isSubmitting} type="submit">
          {t('save')}
        </Button>
      </Toolbar>
    </form>
  );
};

export default LanguageSettingsForm;
