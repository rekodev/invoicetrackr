'use client';

import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  cn
} from '@heroui/react';
import { useMemo, useState } from 'react';

import {
  BankingInformationFormModel,
  UserModel
} from '@/lib/types/models/user';
import {
  isUserBankingDetailsSetUp,
  isUserPersonalInformationSetUp
} from '@/lib/utils/user';

import SignUpForm from './auth/sign-up-form';
import AppLogo from './icons/AppLogo';
import PaymentForm from './payment-form';
import BankAccountForm from './profile/bank-account-form';
import PersonalInformationForm from './profile/personal-information-form';

const steps = [
  {
    id: 'account',
    name: 'Create an account',
    description: 'Setting up your foundation'
  },
  {
    id: 'personal',
    name: 'Personal Information',
    description: 'Tell us about yourself'
  },
  {
    id: 'banking',
    name: 'Banking Details',
    description: 'Add your banking information'
  },
  {
    id: 'payment',
    name: 'Make a Payment',
    description: 'Finalize your registration'
  }
];

type Props = {
  existingUserData?: UserModel;
  existingBankingInformation?: BankingInformationFormModel;
};

export default function MultiStepForm({
  existingUserData,
  existingBankingInformation
}: Props) {
  const initialCurrentStep = useMemo(() => {
    if (!existingUserData) return 0;
    if (isUserPersonalInformationSetUp(existingUserData)) {
      return isUserBankingDetailsSetUp(existingUserData) ? 3 : 2;
    }

    return 1;
  }, [existingUserData]);

  const [currentStep, setCurrentStep] = useState(initialCurrentStep);

  const advanceStep = () => setCurrentStep((prev) => prev + 1);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SignUpForm />;
      case 1:
        return (
          <PersonalInformationForm
            defaultValues={existingUserData}
            onSuccess={advanceStep}
          />
        );
      case 2:
        return (
          <BankAccountForm
            isUserOnboarding
            userId={existingUserData?.id}
            userSelectedBankAccountId={existingUserData?.selectedBankAccountId}
            defaultValues={existingBankingInformation}
            onSuccess={advanceStep}
          />
        );
      case 3:
        return <PaymentForm user={existingUserData} />;
      default:
        null;
    }
  };

  const renderMobileStepper = () => (
    <div className="mx-auto flex w-full min-w-[512px] max-w-lg justify-between px-12 pb-16 md:mx-0 md:hidden">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className="relative flex cursor-pointer flex-col items-center"
          onClick={() => {
            if (!existingUserData || index === 0) return;
            setCurrentStep(index);
          }}
        >
          <div
            className={cn(
              'border-default-400 dark:border-default-800 flex h-9 w-9 items-center justify-center rounded-full border-2 font-semibold',
              {
                'border-1 bg-default-500 bg-opacity-25': index < currentStep,
                'opacity-65': currentStep < index
              }
            )}
          >
            {index < currentStep ? (
              <CheckIcon className="h-4 w-4 text-white" />
            ) : (
              <span className="text-xs">{index + 1}</span>
            )}
            <p className="absolute top-10 mt-1 min-w-16 text-center text-xs">
              {step.name}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className="absolute left-12 top-0 flex h-8 items-center">
              <div
                className={cn('ml-0.5 h-0.5 w-16 bg-white', {
                  'opacity-65': currentStep <= index
                })}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <section
      className={cn(
        'mx-auto flex w-full max-w-7xl flex-col justify-center gap-4 py-4 md:flex-row',
        {
          'px-6': !existingUserData
        }
      )}
    >
      <Card className="border-default-100 from-default-100 via-secondary-50 h-full w-full gap-8 border bg-gradient-to-b md:max-w-sm dark:to-black">
        <CardHeader className="-mt-4 flex-col items-start gap-8 px-8 text-start md:mt-0 md:pt-8">
          <Button
            variant="bordered"
            className="hidden md:flex"
            isDisabled={currentStep <= 0}
            onPress={() => setCurrentStep((prev) => (prev <= 0 ? 0 : prev - 1))}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </Button>
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <AppLogo height={60} width={60} />

              <div className="flex flex-col">
                <h3 className="text-2xl font-bold">InvoiceTrackr</h3>
                <p className="text-default-500">
                  Manage invoices and track your income seamlessly
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardBody className="flex max-h-min md:items-center md:justify-center">
          {renderMobileStepper()}
          <div className="hidden max-w-max md:block">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn('flex cursor-pointer flex-col', {
                  'opacity-65': currentStep < index
                })}
                onClick={() => {
                  if (!existingUserData) return;
                  if (index === 0) return;

                  setCurrentStep(index);
                }}
              >
                <div className="mr-4">
                  {index > 0 && (
                    <div className="bg-default-500 my-1 ml-5 h-12 w-0.5"></div>
                  )}
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        `border-default-400 dark:border-default-800 flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold`,
                        {
                          'border-1 bg-default-500 bg-opacity-25':
                            index < currentStep
                        }
                      )}
                    >
                      {index < currentStep ? (
                        <CheckIcon className="h-5 w-5 text-white" />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>

                    <div>
                      <p className="font-semibold">{step.name}</p>
                      <p className="text-default-500 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
        <CardFooter className="hidden md:flex"></CardFooter>
      </Card>

      <div className="w-full">{renderStep()}</div>
    </section>
  );
}
