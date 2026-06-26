import { FastifyReply, FastifyRequest } from 'fastify';
import { BillingEmail } from '@invoicetrackr/emails';
import Stripe from 'stripe';

import { BadRequestError, InternalServerError } from '../utils/error';
import { appEmailFrom, getAppUrl } from '../config/app';
import {
  getUserByStripeConnectedAccountIdFromDb,
  getUserByStripeCustomerIdFromDb,
  hasProcessedStripeWebhookEvent,
  markStripeWebhookEventProcessed,
  updateBillingStatusInDb,
  upsertStripeMerchantAccountInDb
} from '../database/payment';
import {
  markInvoicePaidByCheckoutSessionInDb,
  markInvoicePaymentFailedByIntentInDb
} from '../database/invoice';
import en from '../locales/en';
import lt from '../locales/lt';
import { resend } from '../config/resend';
import { stripe } from '../config/stripe';
import { syncSubscriptionInDb } from './payment';

const GRACE_PERIOD_DAYS = 3;
const DEFAULT_FORWARD_TO_EMAIL = 'reko.jsx@gmail.com';
const DEFAULT_FORWARD_FROM_EMAIL = 'noreply@invoicetrackr.app';
const locales = { en, lt };

type ResendForwardResponse = {
  data: unknown;
  error: { message: string } | null;
};

type ResendReceiving = typeof resend.emails.receiving & {
  forward: (payload: {
    emailId: string;
    to: string;
    from: string;
  }) => Promise<ResendForwardResponse>;
};

const getCustomerId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
) => (typeof customer === 'string' ? customer : customer?.id);

const forwardReceivedEmail = async (
  emailId: string
): Promise<ResendForwardResponse> => {
  const receiving = resend.emails.receiving as ResendReceiving;
  const to = process.env.RESEND_FORWARD_TO_EMAIL || DEFAULT_FORWARD_TO_EMAIL;
  const from =
    process.env.RESEND_FORWARD_FROM_EMAIL || DEFAULT_FORWARD_FROM_EMAIL;

  return receiving.forward({
    emailId,
    to,
    from
  });
};

const sendBillingEmail = async ({
  email,
  language,
  type
}: {
  email: string;
  language: string;
  type: 'trial-ending' | 'payment-failed';
}) => {
  const locale = locales[language as keyof typeof locales] || locales.en;
  const content =
    type === 'trial-ending'
      ? locale.emails.billing.trialEnding
      : locale.emails.billing.paymentFailed;
  const billingUrl = getAppUrl('/profile/billing');
  const emailHtml = BillingEmail({
    subject: content.subject,
    message: content.text,
    buttonText: locale.emails.billing.buttonText,
    fallbackLabel: locale.emails.billing.fallback,
    note: locale.emails.billing.note,
    billingUrl,
    footer: locale.emails.resetPassword.footer,
    copyright: locale.emails.resetPassword.copyright.replace(
      '{year}',
      String(new Date().getFullYear())
    )
  });

  const { error } = await resend.emails.send({
    from: appEmailFrom,
    to: email,
    subject: content.subject,
    react: emailHtml,
    text: content.text
  });

  if (error) throw new Error(error.message);
};

export const handleStripeWebhook = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) throw new BadRequestError('No signature provided');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody as Buffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    throw new BadRequestError(`Webhook Error: ${(err as Error).message}`);
  }

  if (await hasProcessedStripeWebhookEvent(event.id)) {
    return reply.status(200).send({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.type === 'invoice_payment') {
          await markInvoicePaidByCheckoutSessionInDb({
            checkoutSessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : session.payment_intent?.id,
            invoiceId: session.metadata.invoiceId
              ? Number(session.metadata.invoiceId)
              : undefined,
            userId: session.metadata.userId
              ? Number(session.metadata.userId)
              : undefined,
            publicInvoiceToken: session.metadata.publicInvoiceToken
          });
          break;
        }

        const customerId = getCustomerId(session.customer);
        const user = customerId
          ? await getUserByStripeCustomerIdFromDb(customerId)
          : undefined;

        if (user && session.mode === 'subscription' && session.subscription) {
          const subscription =
            typeof session.subscription === 'string'
              ? await stripe.subscriptions.retrieve(session.subscription)
              : session.subscription;

          await syncSubscriptionInDb(user.id, subscription, {
            paymentSuccessPending: true
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        if (paymentIntent.metadata?.type === 'invoice_payment') {
          await markInvoicePaymentFailedByIntentInDb({
            paymentIntentId: paymentIntent.id,
            publicInvoiceToken: paymentIntent.metadata.publicInvoiceToken
          });
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        const user = await getUserByStripeConnectedAccountIdFromDb(account.id);

        if (user) {
          await upsertStripeMerchantAccountInDb(user.id, {
            stripeConnectedAccountId: account.id,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
            onboardingCompletedAt:
              account.charges_enabled && account.details_submitted
                ? new Date().toISOString()
                : null
          });
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerId(subscription.customer);
        const user = customerId
          ? await getUserByStripeCustomerIdFromDb(customerId)
          : undefined;

        if (user)
          await syncSubscriptionInDb(user.id, subscription, {
            paymentSuccessPending:
              event.type === 'customer.subscription.created' ||
              event.type === 'customer.subscription.resumed' ||
              undefined
          });
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = getCustomerId(subscription.customer);
        const user = customerId
          ? await getUserByStripeCustomerIdFromDb(customerId)
          : undefined;

        if (user) {
          await sendBillingEmail({
            email: user.email,
            language: user.language,
            type: 'trial-ending'
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = getCustomerId(invoice.customer);
        const user = customerId
          ? await getUserByStripeCustomerIdFromDb(customerId)
          : undefined;

        if (user) {
          const graceEndsAt = new Date();
          graceEndsAt.setDate(graceEndsAt.getDate() + GRACE_PERIOD_DAYS);
          await updateBillingStatusInDb(user.id, {
            subscriptionStatus: 'past_due',
            subscriptionGraceEndsAt: graceEndsAt.toISOString()
          });
          await sendBillingEmail({
            email: user.email,
            language: user.language,
            type: 'payment-failed'
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = getCustomerId(invoice.customer);
        const user = customerId
          ? await getUserByStripeCustomerIdFromDb(customerId)
          : undefined;

        if (user) {
          await updateBillingStatusInDb(user.id, {
            subscriptionGraceEndsAt: null
          });
        }
        break;
      }
    }

    await markStripeWebhookEventProcessed(event.id, event.type);

    return reply.status(200).send({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    throw new InternalServerError('Error processing webhook');
  }
};

export const handleResendWebhook = async (
  req: FastifyRequest<{
    Body: {
      type?: string;
      data?: { email_id?: string };
    };
  }>,
  reply: FastifyReply
) => {
  if (req.body.type !== 'email.received') {
    return reply.status(200).send({ received: true });
  }

  const emailId = req.body.data?.email_id;

  if (!emailId) {
    throw new BadRequestError('Received email webhook is missing email_id');
  }

  const { data, error } = await forwardReceivedEmail(emailId);

  if (error) {
    throw new InternalServerError(error.message);
  }

  return reply.status(200).send({ received: true, data });
};
