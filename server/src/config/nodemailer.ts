import nodemailer from "nodemailer";
import "dotenv/config";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "invoicetrackr@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});
