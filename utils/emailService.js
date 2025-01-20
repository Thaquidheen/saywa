// utils/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST_NAME,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.AUTH_EMAIL_USER,
    pass: process.env.AUTH_EMAIL_PASSWORD
  }
});

module.exports.sendEmailOTP = async (email, otp) => {
  const mailOptions = {
    from: 'no-reply@example.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your one-time password is: ${otp}`
  };

  await transporter.sendMail(mailOptions);
};
