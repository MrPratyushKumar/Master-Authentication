// mailtrap/mailtrap.config.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
console.log("SMTP CONFIG:", {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
}); // ← Temporary debug log — remove after fix confirmed

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // sandbox.smtp.mailtrap.io
  port: Number(process.env.SMTP_PORT), // 2525
  auth: {
    user: process.env.SMTP_USER,     // e28aefdd8f6751
    pass: process.env.SMTP_PASS,     // fec73759513dfe
  },
});

export const sender = {
  from: "Your App <no-reply@yourapp.com>",
};