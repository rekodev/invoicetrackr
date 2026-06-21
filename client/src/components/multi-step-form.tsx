'use client';

import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  cn,
  toast
} from '@heroui/react';
import { Fragment, useMemo, useState } from 'react';
import { User } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { PAYMENT_SUCCESS_CONFIRM_PAGE } from '@/lib/constants/pages';
import { isUserPersonalInformationSetUp } from '@/lib/utils/user';

import AppBrand from './app-brand';
import PaymentForm from './payment-form';
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
    },
    {
      id: 'trial',
      shortName: t('steps.trial.short_name'),
      name: t('steps.trial.name'),
      description: t('steps.trial.description')
    }
  ];
  const initialCurrentStep = useMemo(() => {
    if (!existingUserData) return 0;
    if (isUserPersonalInformationSetUp(existingUserData)) return 2;

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

    goToStep(2);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SignUpForm />;
      case 1:
        return (
          <PersonalInformationForm
            defaultValues={existingUserData}
            onSuccess={completePersonalInformation}
          />
        );
      case 2:
        return (
          <PaymentForm
            user={existingUserData}
            onTrialStarted={() => {
              router.push(`${PAYMENT_SUCCESS_CONFIRM_PAGE}?trial=true`);
            }}
          />
        );
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
            if (!existingUserData || index < minimumAllowedStep) return;
            goToStep(index);
          }}
        >
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border-2 font-semibold',
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

  const renderHorizontalStepper = () => (
    <div className="flex w-full items-start">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLocked = !existingUserData || index < minimumAllowedStep;

        return (
          <Fragment key={step.id}>
            <button
              type="button"
              disabled={isLocked}
              onClick={() => goToStep(index)}
              className={cn(
                'flex min-w-7 items-center gap-2 text-left',
                'disabled:cursor-default'
              )}
            >
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition',
                  {
                    'border-secondary/40 bg-secondary/15 text-secondary':
                      isCompleted,
                    'bg-foreground text-background border-foreground':
                      isCurrent,
                    'border-foreground/20 text-muted':
                      !isCompleted && !isCurrent
                  }
                )}
              >
                {isCompleted ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>
              <span
                className={cn(
                  'max-w-16 truncate whitespace-nowrap text-xs font-medium max-[420px]:hidden',
                  isCurrent
                    ? 'text-foreground'
                    : isCompleted
                      ? 'text-muted'
                      : 'text-muted'
                )}
              >
                {step.shortName}
              </span>
            </button>
            {index < steps.length - 1 && (
              <span
                className={cn(
                  'mx-2 mt-3.5 h-0.5 min-w-6 flex-1 rounded-full bg-black/20 dark:bg-white/25',
                  {
                    'bg-secondary/70 dark:bg-secondary/70': isCompleted
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
      <section className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="w-full max-w-lg">
          <SignUpForm headerContent={renderHorizontalStepper()} />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col justify-center gap-4 py-4 md:flex-row">
      <Card className="border-default-100 from-default-100 via-secondary-50 h-full w-full gap-8 border bg-gradient-to-b md:max-w-sm dark:to-black">
        <CardHeader className="-mt-4 flex-col items-start gap-8 px-8 text-start md:mt-0 md:pt-8">
          <Button
            variant="outline"
            className="hidden md:flex"
            isDisabled={currentStep <= minimumAllowedStep}
            onPress={() => goToStep(currentStep - 1)}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            {t('actions.back')}
          </Button>
          <div className="hidden md:block">
            <AppBrand
              logoSize={65}
              wordmarkClassName="hidden sm:flex"
              wordmarkAccentClassName="text-secondary-400 dark:text-secondary-600"
            >
              <p className="text-muted text-sm">{t('branding.tagline')}</p>
            </AppBrand>
          </div>
        </CardHeader>
        <CardContent className="flex max-h-min md:items-center md:justify-center">
          {renderMobileStepper()}
          <div className="hidden max-w-max md:block">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn('flex cursor-pointer flex-col', {
                  'opacity-65': currentStep < index
                })}
                onClick={() => {
                  if (!existingUserData || index < minimumAllowedStep) return;

                  goToStep(index);
                }}
              >
                <div className="mr-4">
                  {index > 0 && (
                    <div className="bg-default-500 my-1 ml-5 h-12 w-0.5"></div>
                  )}
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        `flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold`,
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
                      <p className="text-muted text-sm">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="hidden md:flex"></CardFooter>
      </Card>

      <div className="w-full">{renderStep()}</div>
    </section>
  );
}
