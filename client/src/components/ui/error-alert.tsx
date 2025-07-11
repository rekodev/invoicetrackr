'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Link
} from '@heroui/react';

import { HOME_PAGE } from '@/lib/constants/pages';

const ErrorAlert = () => {
  return (
    <Card className="mx-auto max-w-md gap-4">
      <CardHeader className="flex-col justify-center gap-2 p-6 pb-0 text-center text-2xl font-bold text-foreground">
        <ExclamationTriangleIcon className="size-12 text-danger-400" />
        Oops! Something Went Wrong
      </CardHeader>
      <CardBody className="px-6 pt-0 text-center">
        <p className="text-muted-foreground">
          We encountered an unexpected issue. We apologize for any inconvenience
          and appreciate your patience.
        </p>
      </CardBody>
      <CardFooter className="p-6 pt-2 text-center">
        <Button
          href={HOME_PAGE}
          as={Link}
          color="danger"
          showAnchorIcon
          className="w-full"
        >
          Go Back Home
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ErrorAlert;
