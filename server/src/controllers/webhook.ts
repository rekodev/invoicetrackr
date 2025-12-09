import 'dotenv/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import Stripe from 'stripe';

import { BadRequestError, InternalServerError } from '../utils/error';
import {
  getUserIdByStripeCustomerIdFromDb,
  updateUserSubscriptionStatusInDb
} from '../database/payment';
import { stripe } from '../config/stripe';

export const handleStripeWebhook = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const signature = req.headers['stripe-signature'];

  if (!signature) throw new BadRequestError('No signature provided');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as string | Buffer,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const error = err as Error;
    console.error('Webhook signature verification failed:', error.message);
    throw new BadRequestError(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userId = await getUserIdByStripeCustomerIdFromDb(customerId);

        if (!userId) {
          console.error('User not found for customer:', customerId);
          break;
        }

        await updateUserSubscriptionStatusInDb(userId, subscription.status);

        console.log(`Subscription ${subscription.status} for user ${userId}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userId = await getUserIdByStripeCustomerIdFromDb(customerId);

        if (!userId) {
          console.error('User not found for customer:', customerId);
          break;
        }

        await updateUserSubscriptionStatusInDb(userId, 'canceled');

        console.log(`Subscription canceled for user ${userId}`);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const userId = await getUserIdByStripeCustomerIdFromDb(customerId);

        if (!userId) {
          console.error('User not found for customer:', customerId);
          break;
        }

        await updateUserSubscriptionStatusInDb(userId, 'active');

        console.log(`Payment succeeded for user ${userId}`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const userId = await getUserIdByStripeCustomerIdFromDb(customerId);

        if (!userId) {
          console.error('User not found for customer:', customerId);
          break;
        }

        await updateUserSubscriptionStatusInDb(userId, 'past_due');

        console.log(`Payment failed for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return reply.status(200).send({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    throw new InternalServerError('Error processing webhook');
  }
};
