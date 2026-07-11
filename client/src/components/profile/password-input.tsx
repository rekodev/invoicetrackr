'use client';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { FieldError, Input, Label, TextField } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

type Props = {
  label: string;
  registeredPassword: UseFormRegisterReturn;
  className?: string;
  placeholder?: string;
  isInvalid: boolean;
  errorMessage?: string;
  autoComplete?: string;
};

export default function PasswordInput({
  label,
  registeredPassword,
  className,
  placeholder,
  isInvalid,
  errorMessage,
  autoComplete
}: Props) {
  const t = useTranslations('components.password_input');
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  return (
    <TextField
      variant="secondary"
      isInvalid={isInvalid}
      className={`w-full lg:w-1/2 ${className || ''}`}
    >
      <Label>{label}</Label>
      <div className="flex w-full items-center gap-2">
        <Input
          {...registeredPassword}
          className="w-full"
          autoComplete={autoComplete}
          type={isVisible ? 'text' : 'password'}
          placeholder={placeholder}
        />
        <button
          className="focus:outline-none"
          type="button"
          onClick={toggleVisibility}
          aria-label={t('toggle_visibility')}
        >
          {isVisible ? (
            <EyeIcon className="text-muted pointer-events-none h-5 w-5" />
          ) : (
            <EyeSlashIcon className="text-muted pointer-events-none h-5 w-5" />
          )}
        </button>
      </div>
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}
