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
        <CardHeader className="p-4 px-6">Banking Information</CardHeader>
        <Divider />
        <CardBody className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
          <Input
            {...register('name')}
            label="Bank Name"
            variant="faded"
            labelPlacement="outside"
            placeholder="e.g., Swedbank"
          />
          <Input
            {...register('code')}
            label="Bank Code"
            variant="faded"
            labelPlacement="outside"
            placeholder="e.g., HABALT22"
          />
          <Input
            {...register('accountNumber')}
            label="Bank Account Number"
            variant="faded"
            labelPlacement="outside"
            placeholder="e.g., LT12 1000 0111 0100 1000"
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
                Cancel
              </Button>
            )}
            <Button type="submit" color="secondary" isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
