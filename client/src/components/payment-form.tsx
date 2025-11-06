'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider
} from '@heroui/react';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useTheme } from 'next-themes';
import { FormEvent, useState } from 'react';

import { createCustomer, createSubscription, getStripeCustomerId } from '@/api';
import { updateSession } from '@/lib/actions';
import { PAYMENT_SUCCESS_PAGE } from '@/lib/constants/pages';
import { SUBSCRIPTION_AMOUNT } from '@/lib/constants/subscription';
import { UserModel } from '@/lib/types/models/user';
import { convertToSubcurrency, getCurrencySymbol } from '@/lib/utils/currency';
import { isResponseError } from '@/lib/utils/error';

import Loader from './ui/loader';

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error('NEXT_PUBLIC_STRIPLE_PUBLIC_KEY is not defined');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

type Props = {
  user: UserModel | undefined;
};

function PaymentFormInsideElements({ user }: { user: UserModel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isFormLoading = !stripe || !elements;

  const handleSubmit = async (event: FormEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !user.id) return;

    setIsLoading(true);

    let shouldUpdateSession = false;

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setErrorMessage(submitError.message || '');
        return;
      }

      let stripeCustomerId;

      const getCustomerResp = await getStripeCustomerId(user.id);

      if (isResponseError(getCustomerResp)) {
        setErrorMessage('Failed to get customer');
        return;
      }

      const { customerId: existingCustomerId } = getCustomerResp.data;

      if (existingCustomerId) {
        stripeCustomerId = existingCustomerId;
      } else {
        const createCustomerResp = await createCustomer({
          userId: user.id,
          email: user.email,
          name: user.name
        });

        if (isResponseError(createCustomerResp)) {
          setErrorMessage('Failed to create customer');
          return;
        }

        stripeCustomerId = createCustomerResp.data.customerId;
      }

      const subscriptionCreationResp = await createSubscription(
        user.id,
        stripeCustomerId
      );

      if (isResponseError(subscriptionCreationResp)) {
        setErrorMessage('Failed to create subscription');
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: subscriptionCreationResp.data.clientSecret,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success`
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message || '');
        setIsLoading(false);
        return;
      }

      shouldUpdateSession = true;
    } catch (e) {
      console.error(e);
      setErrorMessage('Failed to process payment. Please try again.');
      setIsLoading(false);
    }

    if (shouldUpdateSession) {
      try {
        await updateSession({
          newSession: {
            ...user,
            id: String(user.id),
            isOnboarded: true,
            isSubscriptionActive: true
          },
          redirectPath: PAYMENT_SUCCESS_PAGE
        });
      } catch (sessionError) {
        console.error('Failed to update session', sessionError);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Card as="form" className="mx-auto max-w-4xl" onSubmit={handleSubmit}>
      <CardHeader className="p-4 px-6">Payment</CardHeader>
      <Divider />
      <CardBody className="px-5 py-4">
        {isFormLoading ? (
          <Loader />
        ) : (
          <>
            <PaymentElement />
            {errorMessage && (
              <p className="text-sm text-rose-500">{errorMessage}</p>
            )}
          </>
        )}
      </CardBody>
      <CardFooter className="px-6 py-4">
        <Button
          className="w-full"
          type="submit"
          color="secondary"
          isDisabled={!stripe || isLoading}
        >
          {isLoading
            ? 'Processing...'
            : `Pay ${getCurrencySymbol(user.currency)}${SUBSCRIPTION_AMOUNT}`}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function PaymentForm({ user }: Props) {
  const { theme } = useTheme();

  const isDarkMode = theme === 'dark';

  if (!user) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: 'subscription',
        amount: convertToSubcurrency(SUBSCRIPTION_AMOUNT),
        currency: user.currency,
        appearance: {
          theme: 'flat',
          rules: {
            '.AccordionItem': {
              border: 'none',
              padding: '0.25rem',
              boxShadow: 'none',
              backgroundColor: 'rgba(0,0,0,0)'
            },
            '.Block': {
              border: 'none',
              padding: '0.25rem',
              boxShadow: 'none',
              backgroundColor: 'rgba(0,0,0,0)'
            },
            '.Input': {
              color: isDarkMode ? '#3f3f46' : '#71717a',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              maxHeight: '4rem'
            }
          },
          variables: {
            colorPrimary: isDarkMode ? '#ffffff' : '#18181b',
            colorTextSecondary: '#a1a1aa',
            colorText: isDarkMode ? '#e4e4e7' : '#52525b',
            colorBackground: 'rgba(0, 0, 0, 0)',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '8px'
          }
        }
      }}
    >
      <PaymentFormInsideElements user={user} />
    </Elements>
  );
}
