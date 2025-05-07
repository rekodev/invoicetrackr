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
  { id: 'payment', name: 'Payment', description: 'Finalize your registration' }
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

  return (
    <section
      className={cn('mx-auto flex w-full max-w-7xl justify-center gap-4 py-4', {
        'px-6': !existingUserData
      })}
    >
      <Card className="h-full w-full max-w-sm gap-8 border border-default-100 bg-gradient-to-b from-default-100 via-secondary-50 dark:to-black">
        <CardHeader className="flex-col items-start gap-8 px-8 pt-8 text-start">
          <Button
            variant="bordered"
            onPress={() => setCurrentStep((prev) => (prev <= 1 ? 1 : prev - 1))}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Back
          </Button>
          <div>
            <h3 className="text-2xl font-bold">InvoiceTrackr</h3>
            <p className="text-default-500">Do something</p>
          </div>
        </CardHeader>
        <CardBody className="flex max-h-min items-center justify-center">
          <div className="max-w-max">
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
                    <div className="my-1 ml-5 h-12 w-0.5 bg-default-500"></div>
                  )}
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        `flex h-10 w-10 items-center justify-center rounded-full border-2 border-default-400 font-semibold dark:border-default-800`,
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
                      <p className="text-sm text-default-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
        <CardFooter></CardFooter>
      </Card>

      <div className="w-full">{renderStep()}</div>
    </section>
  );
}
