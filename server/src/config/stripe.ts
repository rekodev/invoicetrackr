import Stripe from 'stripe';

import { loadEnv } from './env';

loadEnv();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
