'use client';

import { ArrowRightIcon } from '@heroicons/react/20/solid';
import {
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Link
} from '@heroui/react';
import { useActionState } from 'react';

import { signUp } from '@/lib/actions';

const initialState = {
  message: '',
  ok: false
};

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  const renderSubmissionMessage = () => {
    if (!state?.message) return null;

    if (!state.ok) {
      return (
        <div className="mb-6 flex items-center gap-1">
          <ExclamationCircleIcon className="h-5 w-5 text-danger-500" />
          <p className="text-sm text-danger-500">{state.message}</p>
        </div>
      );
    }

    return (
      <div className="mb-6 flex items-center gap-1">
        <CheckCircleIcon className="h-5 w-5 text-success-500" />
        <p className="text-sm text-success-500">{state.message}</p>
      </div>
    );
  };

  return (
    <Card className="w-full dark:border dark:border-default-100" isBlurred>
      <CardHeader className="p-8 pb-0">
        <h1 className="text-3xl font-medium">Sign Up</h1>
      </CardHeader>
      <CardBody className="p-8 pb-0">
        <form action={formAction} className="flex flex-col gap-4">
          <Input
            isRequired
            labelPlacement="outside"
            variant="faded"
            id="email"
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email address"
            required
          />
          <Input
            isRequired
            labelPlacement="outside"
            variant="faded"
            id="password"
            type="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            required
            minLength={6}
          />
          <Input
            isRequired
            labelPlacement="outside"
            variant="faded"
            id="confirm-password"
            type="password"
            name="confirm-password"
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            minLength={6}
          />
          <Button
            className="w-full justify-between"
            aria-disabled={isPending}
            type="submit"
            isLoading={isPending}
            endContent={<ArrowRightIcon className="h-5 w-5" />}
            color="secondary"
          >
            Sign Up
          </Button>
          <div aria-live="polite" aria-atomic="true">
            {renderSubmissionMessage()}
          </div>
        </form>
      </CardBody>
      <CardFooter className="flex flex-col items-center justify-center gap-1 pb-8 pt-0">
        <div className="flex gap-1">
          <p className="text-md">Already have an account?</p>{' '}
          <Link color="secondary" href="/login">
            Log In
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
