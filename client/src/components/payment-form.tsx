'use client';

import {
  Button,
  Card,
  CardFooter,
  CardBody,
  CardHeader,
  Divider
} from '@heroui/react';
import {
  Elements,
  useElements,
  useStripe,
  PaymentElement
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useTheme } from 'next-themes';
import { FormEvent, useState } from 'react';

import { createCustomer, createSubscription, getStripeCustomerId } from '@/api';
import { updateSession } from '@/lib/actions';
import { PAYMENT_SUCCESS_PAGE } from '@/lib/constants/pages';
import { UserModel } from '@/lib/types/models/user';
import { convertToSubcurrency, getCurrencySymbol } from '@/lib/utils/currency';

import Loader from './ui/loader';

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error('NEXT_PUBLIC_STRIPLE_PUBLIC_KEY is not defined');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);
const AMOUNT = 4.99;

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

      const {
        data: { customerId: existingCustomerId }
      } = await getStripeCustomerId(user.id);

      if (existingCustomerId) {
        stripeCustomerId = existingCustomerId;
      } else {
        const createCustomerResp = await createCustomer({
          userId: user.id,
          email: user.email,
          name: user.name
        });

        if ('errors' in createCustomerResp) {
          setErrorMessage('Failed to create customer');
          return;
        }

        stripeCustomerId = createCustomerResp.data.customerId;
      }

      const subscriptionCreationResp = await createSubscription(
        user.id,
        stripeCustomerId
      );

      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: subscriptionCreationResp.data.clientSecret,
        confirmParams: {
          return_url: `http://localhost:3000/payment-success`
        },
        redirect: 'if_required'
      });

      if (error) {
        setErrorMessage(error.message || '');
        return;
      }

      shouldUpdateSession = true;
    } catch (e) {
      console.error(e);
      setErrorMessage('Something occurred');
    } finally {
      setIsLoading(false);
    }

    if (shouldUpdateSession) {
      try {
        await updateSession({
          newSession: {
            ...user,
            isOnboarded: true,
            isSubscriptionActive: true
          },
          redirectPath: PAYMENT_SUCCESS_PAGE
        });
      } catch (sessionError) {
        console.error('Failed to update session', sessionError);
      }
    }
  };

  return (
    <Card as="form" onSubmit={handleSubmit}>
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
            : `Pay ${getCurrencySymbol(user.currency)}${AMOUNT}`}
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
        amount: convertToSubcurrency(AMOUNT),
        currency: 'eur',
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
