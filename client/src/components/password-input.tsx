'use client';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Input } from "@heroui/react";
import { useState } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

type Props = {
  label: string;
  registeredPassword: UseFormRegisterReturn;
  className?: string;
  placeholder?: string;
  isInvalid: boolean;
  errorMessage?: string;
};

export default function PasswordInput({
  label,
  registeredPassword,
  className,
  placeholder,
  isInvalid,
  errorMessage,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  return (
    <Input
      {...registeredPassword}
      label={label}
      variant='faded'
      labelPlacement='outside'
      type={isVisible ? 'text' : 'password'}
      className={`col-span-1 col-start-1 ${className}`}
      placeholder={placeholder}
      isInvalid={isInvalid}
      errorMessage={errorMessage}
      endContent={
        <button
          className='focus:outline-none'
          type='button'
          onClick={toggleVisibility}
          aria-label='toggle password visibility'
        >
          {isVisible ? (
            <EyeIcon className='w-5 h-5 text-default-400 pointer-events-none' />
          ) : (
            <EyeSlashIcon className='w-5 h-5 text-default-400 pointer-events-none' />
          )}
        </button>
      }
    />
  );
}
