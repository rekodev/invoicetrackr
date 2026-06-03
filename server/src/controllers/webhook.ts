import { FastifyReply, FastifyRequest } from 'fastify';
import Stripe from 'stripe';

import { BadRequestError, InternalServerError } from '../utils/error';
import {
  getUserByStripeCustomerIdFromDb,
  hasProcessedStripeWebhookEvent,
  markStripeWebhookEventProcessed,
  updateBillingStatusInDb
} from '../database/payment';
import en from '../locales/en';
import lt from '../locales/lt';
import { resend } from '../config/resend';
import { stripe } from '../config/stripe';
import { syncSubscriptionInDb } from './payment';

const GRACE_PERIOD_DAYS = 3;
const locales = { en, lt };

const getCustomerId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
) => (typeof customer === 'string' ? customer : customer?.id);

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

  const { error } = await resend.emails.send({
    from: 'InvoiceTrackr <noreply@invoicetrackr.app>',
    to: email,
    subject: content.subject,
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
