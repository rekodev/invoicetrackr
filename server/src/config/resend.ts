import 'dotenv/config';
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
