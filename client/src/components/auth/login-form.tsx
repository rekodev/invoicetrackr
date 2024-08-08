'use client';

import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Link,
} from '@nextui-org/react';
import { useFormState } from 'react-dom';

import { authenticate } from '@/lib/actions';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useFormState(
    authenticate,
    undefined
  );

  return (
    <Card
      className='mx-auto w-full max-w-lg border border-neutral-800'
      isBlurred
    >
      <CardHeader className='p-8 pb-0'>
        <h1 className='text-3xl font-medium'>Log In</h1>
      </CardHeader>
      <CardBody className='p-8 pb-0'>
        <form action={formAction} className='flex flex-col gap-4'>
          <Input
            labelPlacement='outside'
            variant='faded'
            id='email'
            type='email'
            name='email'
            label='Email'
            placeholder='Enter your email address'
            required
          />
          <Input
            labelPlacement='outside'
            variant='faded'
            id='password'
            type='password'
            name='password'
            label='Password'
            placeholder='Enter password'
            required
            minLength={6}
          />
          <Button
            className='w-full justify-between'
            aria-disabled={isPending}
            isLoading={isPending}
            type='submit'
            endContent={<ArrowRightIcon className='h-5 w-5' />}
            color='secondary'
          >
            Log in
          </Button>
          <div aria-live='polite' aria-atomic='true'>
            {errorMessage && (
              <div className='flex items-center gap-1 mb-6'>
                <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
                <p className='text-sm text-red-500'>{errorMessage}</p>
              </div>
            )}
          </div>
        </form>
      </CardBody>
      <CardFooter className='flex flex-col items-center justify-center pt-0 pb-8 gap-1'>
        <Link color='secondary' href='/forgot-password'>
          Forgot Password?
        </Link>
        <div className='flex gap-1'>
          <p className='text-md'>Need to create an account?</p>{' '}
          <Link color='secondary' href='/sign-up'>
            Sign Up
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
