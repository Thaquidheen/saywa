const { google } = require("googleapis");
const nodemailer = require("nodemailer");

// Define the required scope for Gmail API
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

// Load credentials and token from environment variables
const CREDENTIALS_JSON = process.env.CREDENTIALS_JSON; // Entire content of credentials.json stored in an environment variable
const GMAIL_TOKEN_JSON = process.env.GMAIL_TOKEN_JSON; // Entire content of gmail_token.json stored in an environment variable

// Authorize the client with credentials and tokens
async function authorize() {
  if (!CREDENTIALS_JSON || !GMAIL_TOKEN_JSON) {
    throw new Error("Missing CREDENTIALS_JSON or GMAIL_TOKEN_JSON in environment variables.");
  }

  const { client_secret, client_id, redirect_uris } = JSON.parse(CREDENTIALS_JSON).web;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  try {
    oAuth2Client.setCredentials(JSON.parse(GMAIL_TOKEN_JSON));
    return oAuth2Client;
  } catch (error) {
    console.error("Error loading Gmail token:", error.message);
    throw new Error("Failed to authorize Gmail API client.");
  }
}

// Function to send an email using Gmail API and nodemailer
async function sendEmail(auth, { from, to, subject, text, attachments }) {
  // Create a nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: from,
      clientId: auth._clientId,
      clientSecret: auth._clientSecret,
      refreshToken: auth.credentials.refresh_token,
    },
  });

  const mailOptions = {
    from: `Saywa <reservations@saywalimo.com>`, // Use sender's email
    to, // Recipient email
    subject, // Email subject
    html: text, // Email body (HTML content)
    attachments, // Email attachments (if any)
  };

  // Send mail
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return reject("Email sending failed");
      }
      console.log("Email sent:", info.response);
      resolve("Email sent successfully");
    });
  });
}

// Function to handle sending an email
async function handleSendEmail(data) {
  const auth = await authorize();

  try {
    const result = await sendEmail(auth, {
      from: "reservations@saywalimo.com",
      to: data.to,
      subject: data.subject,
      text: data.text,
    });

    return result;
  } catch (error) {
    console.error("Error in handleSendEmail:", error);
    throw error;
  }
}

// Function to handle sending an email with attachments
async function handleSendEmailAttachment(data) {
  const auth = await authorize();

  try {
    const result = await sendEmail(auth, {
      from: "reservations@saywalimo.com",
      to: data.to,
      subject: data.subject,
      text: data.text,
      attachments: data.attachments,
    });

    return result;
  } catch (error) {
    console.error("Error in handleSendEmailAttachment:", error);
    throw error;
  }
}

module.exports = {
  handleSendEmail,
  handleSendEmailAttachment,
};
