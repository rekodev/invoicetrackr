'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import { Button, Card, cn, Separator } from '@heroui/react';
import { User } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';

import { DASHBOARD_PAGE } from '@/lib/constants/pages';
import { isUserPersonalInformationSetUp } from '@/lib/utils/user';

import AuthCardHeader from './auth/auth-card-header';
import SignUpForm from './auth/sign-up-form';
import FreelancerDetailsStep from './onboarding/freelancer-details-step';
import InvoiceDefaultsStep from './onboarding/invoice-defaults-step';
import BankAccountForm from './profile/bank-account-form';

type Props = {
  existingUserData?: User;
};

export default function MultiStepForm({ existingUserData }: Props) {
  const t = useTranslations('sign_up.multi_step');
  const router = useRouter();

  const steps = [
    {
      id: 'personal',
      shortName: t('steps.personal.short_name'),
      name: t('steps.personal.name'),
      description: t('steps.personal.description')
    },
    {
      id: 'banking',
      shortName: t('steps.banking.short_name'),
      name: t('steps.banking.name'),
      description: t('steps.banking.description')
    },
    {
      id: 'defaults',
      shortName: t('steps.defaults.short_name'),
      name: t('steps.defaults.name'),
      description: t('steps.defaults.description')
    }
  ];
  const initialCurrentStep = (() => {
    if (!existingUserData) return 0;
    if (!isUserPersonalInformationSetUp(existingUserData)) return 0;
    if (!existingUserData.selectedBankAccountId) return 1;
    return 2;
  })();

  const [currentStep, setCurrentStep] = useState(initialCurrentStep);
  const [furthestStep, setFurthestStep] = useState(initialCurrentStep);
  const goToStep = (step: number) => {
    if (step <= furthestStep) setCurrentStep(step);
  };

  const completeOnboarding = () => {
    router.refresh();
    router.push(DASHBOARD_PAGE);
  };

  const advanceToStep = (step: number) => {
    setFurthestStep((current) => Math.max(current, step));
    setCurrentStep(step);
  };

  const renderStepHeader = () => (
    <div className="w-full">{renderHorizontalStepper()}</div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <FreelancerDetailsStep
            user={existingUserData!}
            onSuccess={() => advanceToStep(1)}
          />
        );
      case 1:
        return (
          <Card.Content className="p-6">
            <p className="text-muted mb-4 text-sm">
              {t('banking.optional_note')}
            </p>
            <BankAccountForm
              variant="inline"
              userId={existingUserData?.id}
              userSelectedBankAccountId={
                existingUserData?.selectedBankAccountId
              }
              isUserOnboarding
              shouldSelectOnCreate
              onSkip={() => advanceToStep(2)}
              onSuccess={() => advanceToStep(2)}
            />
          </Card.Content>
        );
      case 2:
        return (
          <InvoiceDefaultsStep
            user={existingUserData!}
            onSuccess={completeOnboarding}
          />
        );
      default:
        null;
    }
  };

  const renderHorizontalStepper = () => (
    <div className="flex w-full items-center">
      {steps.map((step, index) => {
        const isCompleted = index < furthestStep;
        const isCurrent = index === currentStep;

        return (
          <Fragment key={step.id}>
            <div className="flex min-w-0 shrink-0 items-center gap-2">
              <Button
                type="button"
                isIconOnly
                size="sm"
                variant={isCurrent ? 'primary' : 'outline'}
                isDisabled={index > furthestStep}
                onPress={() => goToStep(index)}
                className={cn('h-8 min-w-8 text-xs font-medium', {
                  'opacity-55': index > furthestStep
                })}
              >
                {isCompleted ? <CheckIcon className="h-4 w-4" /> : index + 1}
              </Button>
              <span
                className={cn(
                  'max-w-16 truncate whitespace-nowrap text-xs font-medium max-[420px]:hidden',
                  isCurrent ? 'text-foreground' : 'text-muted'
                )}
              >
                {step.shortName}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'border-default-300 mx-2 min-w-6 flex-1 border-t',
                  {
                    'border-secondary/70': isCompleted
                  }
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );

  if (!existingUserData) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-lg">
          <SignUpForm />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 items-center justify-center py-2 md:py-6">
      <Card className="w-full max-w-xl border">
        <AuthCardHeader
          title={steps[currentStep].name}
          description={steps[currentStep].description}
        >
          {renderStepHeader()}
        </AuthCardHeader>
        <Separator />
        {renderStep()}
      </Card>
    </section>
  );
}
