import nodemailer from "nodemailer";
import "dotenv/config";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "invoicetrackr@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});
