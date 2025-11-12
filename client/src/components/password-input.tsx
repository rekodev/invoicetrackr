'use client';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Input } from '@heroui/react';
import { UseFormRegisterReturn } from 'react-hook-form';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

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
    <Input
      {...registeredPassword}
      autoComplete={autoComplete}
      label={label}
      variant="faded"
      labelPlacement="outside"
      type={isVisible ? 'text' : 'password'}
      className={`col-span-1 col-start-1 ${className}`}
      placeholder={placeholder}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      endContent={
        <button
          className="focus:outline-none"
          type="button"
          onClick={toggleVisibility}
          aria-label={t('toggle_visibility')}
        >
          {isVisible ? (
            <EyeIcon className="text-default-400 pointer-events-none h-5 w-5" />
          ) : (
            <EyeSlashIcon className="text-default-400 pointer-events-none h-5 w-5" />
          )}
        </button>
      }
    />
  );
}
