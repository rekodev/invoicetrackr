import {
  CheckCircleIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button, Card, CardBody, CardFooter, CardHeader } from '@heroui/react';
import Link from 'next/link';

import { ADD_NEW_INVOICE_PAGE } from '@/lib/constants/pages';

// TODO: Improve Page UI
export default function PaymentSuccessPage() {
  return (
    <Card
      as="section"
      className="mx-auto w-full max-w-screen-md border-none bg-transparent shadow-none"
    >
      <CardHeader className="flex flex-col items-center gap-3 pb-0 pt-6">
        <div className="rounded-full bg-success/10 p-3">
          <CheckCircleIcon className="h-12 w-12 text-success" />
        </div>

        <h1 className="mb-4 text-4xl font-bold leading-none tracking-tight text-gray-900 dark:text-white md:text-5xl lg:mb-6 xl:text-6xl">
          Payment Successful!
        </h1>
      </CardHeader>

      <CardBody className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-warning" />
          <h2 className="text-2xl font-semibold">Welcome to the app!</h2>
          <SparklesIcon className="h-5 w-5 text-warning" />
        </div>

        <p className="text-default-500">
          Thank you for your payment. Your account has been successfully
          activated and you now have full access to all features.
        </p>

        <div className="mt-2 flex w-full max-w-max flex-col gap-6 rounded-lg bg-default-100 p-6 backdrop:blur-3xl">
          <div className="flex flex-col gap-1">
            <p className="font-medium">What's next?</p>
            <p className="text-sm text-default-500">
              Start by creating an invoice to begin tracking your finances.
            </p>
          </div>
          <Button
            as={Link}
            size="lg"
            href={ADD_NEW_INVOICE_PAGE}
            color="secondary"
            variant="solid"
            className="w-full font-medium"
            startContent={<DocumentTextIcon className="h-5 w-5" />}
          >
            Create An Invoice
          </Button>
        </div>
      </CardBody>

      <CardFooter className="flex justify-center py-5"></CardFooter>
    </Card>
  );
}
