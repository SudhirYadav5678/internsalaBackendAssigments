// mailer.js
import nodemailer from "nodemailer"
import dotenv from "dotenv"
require("dotenv").config({path:"./src/env"});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtpEmail(toEmail, otp) {
  const mailOptions = {
    from: `"OTP Verification" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 10 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${toEmail}`);
  } catch (error) {
    console.error(`❌ Error sending OTP email: ${error.message}`);
    throw error;
  }
}

module.exports = { sendOtpEmail };
