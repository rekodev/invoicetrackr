import { Resend } from "resend";
import "dotenv/config";

export const resend = new Resend(process.env.RESEND_EMAIL_API_KEY);
