import { Resend } from 'resend';

import { loadEnv } from './env';

loadEnv();

export const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
