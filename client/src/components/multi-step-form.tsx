'use client';

import { Button, cn, toast } from '@heroui/react';
import { Fragment, useMemo, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { User } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { DASHBOARD_PAGE } from '@/lib/constants/pages';
import { isUserPersonalInformationSetUp } from '@/lib/utils/user';

import PersonalInformationForm from './profile/personal-information-form';
import SignUpForm from './auth/sign-up-form';

type Props = {
  existingUserData?: User;
};

export default function MultiStepForm({ existingUserData }: Props) {
  const t = useTranslations('sign_up.multi_step');
  const router = useRouter();

  const steps = [
    {
      id: 'account',
      shortName: t('steps.account.short_name'),
      name: t('steps.account.name'),
      description: t('steps.account.description')
    },
    {
      id: 'personal',
      shortName: t('steps.personal.short_name'),
      name: t('steps.personal.name'),
      description: t('steps.personal.description')
    }
  ];
  const initialCurrentStep = useMemo(() => {
    if (!existingUserData) return 0;
    if (isUserPersonalInformationSetUp(existingUserData)) return 1;

    return 1;
  }, [existingUserData]);
  const minimumAllowedStep = existingUserData ? 1 : 0;

  const [currentStep, setCurrentStep] = useState(initialCurrentStep);
  const goToStep = (step: number) => {
    setCurrentStep(Math.max(minimumAllowedStep, step));
  };

  const completePersonalInformation = async () => {
    if (!existingUserData?.id) {
      toast(t('errors.missing_user'), { variant: 'danger' });
      return;
    }

    router.refresh();
    router.push(DASHBOARD_PAGE);
  };

  const renderStepHeader = () => (
    <div className="w-full">{renderHorizontalStepper()}</div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SignUpForm headerContent={renderStepHeader()} />;
      case 1:
        return (
          <PersonalInformationForm
            cardHeaderTitle={steps[1].name}
            cardHeaderDescription={steps[1].description}
            defaultValues={existingUserData}
            headerContent={renderStepHeader()}
            hideEmailVerificationBanner
            onSuccess={completePersonalInformation}
          />
        );
      default:
        null;
    }
  };

  const renderHorizontalStepper = () => (
    <div className="flex w-full items-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <Fragment key={step.id}>
            <div className="flex min-w-0 shrink-0 items-center gap-2">
              <Button
                type="button"
                isIconOnly
                size="sm"
                variant={isCurrent ? 'primary' : 'outline'}
                isDisabled={!isCurrent}
                onPress={() => goToStep(index)}
                className={cn('h-8 min-w-8 text-xs font-medium', {
                  'opacity-55': !isCurrent
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
          <SignUpForm headerContent={renderHorizontalStepper()} />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 items-center justify-center py-2 md:py-6">
      <div className="w-full max-w-lg">{renderStep()}</div>
    </section>
  );
}
