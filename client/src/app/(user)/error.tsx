'use client';

import {
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { useEffect } from 'react';

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 text-center">
        <div className="bg-danger/10 flex items-center justify-center rounded-full p-4">
          <ExclamationTriangleIcon className="text-danger size-8" />
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="text-default-500">
            We encountered an unexpected error. Please try refreshing the page
            or contact support if the problem persists.
          </p>
        </div>

        <Button onPress={reset} variant="ghost" className="gap-2">
          <ArrowPathIcon className="size-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
