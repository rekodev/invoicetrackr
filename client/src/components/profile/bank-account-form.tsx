'use client';

import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Input
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SubmitHandler, useForm } from 'react-hook-form';

import { addBankingInformationAction } from '@/lib/actions/banking-information';
import { BANKING_INFORMATION_PAGE } from '@/lib/constants/pages';
import {
  BankingInformationFormModel,
  bankingInformationSchema
} from '@/lib/types/models/user';

type Props = {
  userId: number | undefined;
  userSelectedBankAccountId?: number;
  defaultValues?: BankingInformationFormModel;
  onSuccess?: () => void;
  isUserOnboarding?: boolean;
};

export default function BankAccountForm({
  onSuccess,
  userId,
  defaultValues,
  userSelectedBankAccountId,
  isUserOnboarding
}: Props) {
  const t = useTranslations('profile.banking_information.form');
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting }
  } = useForm<BankingInformationFormModel>({
    defaultValues,
    resolver: zodResolver(bankingInformationSchema)
  });

  const onSubmit: SubmitHandler<BankingInformationFormModel> = async (data) => {
    if (!userId) return;

    const response = await addBankingInformationAction(
      userId,
      data,
      !!userSelectedBankAccountId,
      isUserOnboarding
    );

    addToast({
      title: response.message,
      color: response.ok ? 'success' : 'danger'
    });

    if (!response.ok) {
      if (response.validationErrors) {
        Object.keys(response.validationErrors).map((key) => {
          setError(key as keyof BankingInformationFormModel, {
            message: response.validationErrors?.[key]
          });
        });
      }

      return;
    }

    if (onSuccess) {
      onSuccess();
    } else {
      router.push(BANKING_INFORMATION_PAGE);
    }
  };

  return (
    <Card className="w-full bg-transparent dark:border dark:border-neutral-800">
      <form
        aria-label="Banking Information Form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <CardHeader className="p-4 px-6">{t('title.create')}</CardHeader>
        <Divider />
        <CardBody className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <Input
            {...register('name')}
            label={t('bank_name')}
            variant="faded"
            labelPlacement="outside"
            placeholder={t('bank_name_placeholder')}
          />
          <Input
            {...register('code')}
            label={t('bank_code')}
            variant="faded"
            labelPlacement="outside"
            placeholder={t('bank_code_placeholder')}
          />
          <Input
            {...register('accountNumber')}
            label={t('bank_account_number')}
            variant="faded"
            labelPlacement="outside"
            placeholder={t('bank_account_number_placeholder')}
          />
        </CardBody>
        <CardFooter className="justify-end gap-2 p-6">
          <div className="flex gap-2">
            {!isUserOnboarding && (
              <Button
                color="danger"
                variant="light"
                onPress={() => router.push(BANKING_INFORMATION_PAGE)}
              >
                {t('actions.cancel')}
              </Button>
            )}
            <Button type="submit" color="secondary" isLoading={isSubmitting}>
              {t('actions.save')}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
