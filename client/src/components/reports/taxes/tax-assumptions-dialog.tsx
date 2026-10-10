'use client';

import {
  Button,
  Checkbox,
  Description,
  FieldError,
  Input,
  Label,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  toast
} from '@heroui/react';
import type { TaxProfile } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';

import { saveTaxProfileAction } from '@/lib/actions/tax';
import { TAX_EXPENSE_METHODS } from '@/lib/constants/tax';
import {
  getInitialTaxProfileData,
  TaxProfileFormData,
  toTaxProfileBody
} from '@/lib/utils/tax';

type Props = {
  userId: number;
  year: number;
  profile: TaxProfile | null;
  isOpen: boolean;
  onClose: () => void;
};

const TaxAssumptionsDialog = ({
  userId,
  year,
  profile,
  isOpen,
  onClose
}: Props) => {
  const t = useTranslations('reports.taxes.dialog');
  const tMethods = useTranslations('reports.taxes.methods');
  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    setError,
    reset
  } = useForm<TaxProfileFormData>({
    defaultValues: getInitialTaxProfileData(profile)
  });
  const isEditMode = Boolean(profile);

  useEffect(() => {
    if (isOpen) reset(getInitialTaxProfileData(profile));
  }, [isOpen, profile, reset]);

  const onSubmit: SubmitHandler<TaxProfileFormData> = async (data) => {
    const response = await saveTaxProfileAction({
      userId,
      year,
      profile: toTaxProfileBody(data)
    });

    toast(response.message || '', {
      variant: response.ok ? 'success' : 'danger'
    });

    if (!response.ok) {
      Object.entries(response.validationErrors ?? {}).forEach(
        ([key, message]) => setError(key as keyof TaxProfileFormData, { message })
      );
      return;
    }

    onClose();
  };

  const renderCheckbox = (
    name: 'hasEmploymentPsdCoverage' | 'hasAdditionalPensionAccumulation',
    label: string,
    help?: string
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Checkbox
          variant="secondary"
          isSelected={field.value}
          onChange={field.onChange}
        >
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Content>
            <Label>{label}</Label>
            {help ? <Description>{help}</Description> : null}
          </Checkbox.Content>
        </Checkbox>
      )}
    />
  );

  const renderTextField = (
    name: 'activityStartDate' | 'activityEndDate' | 'otherDeclaredIncome',
    label: string,
    type: string,
    help?: string
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField variant="secondary" isInvalid={Boolean(errors[name])}>
          <Label>{label}</Label>
          <Input
            name={field.name}
            type={type}
            inputMode={type === 'text' ? 'decimal' : undefined}
            min={type === 'date' ? `${year}-01-01` : undefined}
            max={type === 'date' ? `${year}-12-31` : undefined}
            value={field.value ?? ''}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
          {help ? <Description>{help}</Description> : null}
          {errors[name]?.message ? (
            <FieldError>{errors[name]?.message}</FieldError>
          ) : null}
        </TextField>
      )}
    />
  );

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <Modal.Header>
              <Modal.Heading>{t('title', { year })}</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col gap-5">
              <Controller
                control={control}
                name="expenseMethod"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onChange={field.onChange}
                    isInvalid={Boolean(errors.expenseMethod)}
                  >
                    <Label>{t('fields.expense_method')}</Label>
                    <Description>{t('fields.expense_method_help')}</Description>
                    {TAX_EXPENSE_METHODS.map((method) => (
                      <Radio key={method} value={method}>
                        <Radio.Content>
                          <Radio.Control>
                            <Radio.Indicator />
                          </Radio.Control>
                          {tMethods(method)}
                        </Radio.Content>
                      </Radio>
                    ))}
                    <FieldError>{errors.expenseMethod?.message}</FieldError>
                  </RadioGroup>
                )}
              />
              {renderCheckbox(
                'hasEmploymentPsdCoverage',
                t('fields.psd_coverage'),
                t('fields.psd_coverage_help')
              )}
              {renderCheckbox(
                'hasAdditionalPensionAccumulation',
                t('fields.pension')
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {renderTextField('activityStartDate', t('fields.start'), 'date')}
                {renderTextField('activityEndDate', t('fields.end'), 'date')}
                <p className="text-muted text-xs sm:col-span-2">
                  {t('fields.dates_help')}
                </p>
              </div>
              {renderTextField(
                'otherDeclaredIncome',
                t('fields.other_income'),
                'text',
                t('fields.other_income_help')
              )}
            </Modal.Body>
            <Modal.Footer>
              <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
                <Button variant="ghost" className="w-full sm:w-auto" onPress={onClose}>
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  isDisabled={isSubmitting || (isEditMode && !isDirty)}
                >
                  {t('save')}
                </Button>
              </div>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
};

export default TaxAssumptionsDialog;
