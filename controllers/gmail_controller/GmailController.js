const { google } = require("googleapis");
const nodemailer = require("nodemailer");

// Define the required scope for Gmail API
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

async function authorize() {
  // Ensure your env variables exist:
  if (!process.env.CREDENTIALS_JSON || !process.env.GMAIL_TOKEN_JSON) {
    throw new Error("Missing CREDENTIALS_JSON or GMAIL_TOKEN_JSON in environment variables.");
  }

  // Parse the JSON from environment variables
  const credentials = JSON.parse(process.env.CREDENTIALS_JSON);
  const token = JSON.parse(process.env.GMAIL_TOKEN_JSON);

  // Destructure the relevant fields from credentials
  const { client_secret, client_id, redirect_uris } = credentials.web;

  // Create an OAuth2 client
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Set the token
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}

// Function to send an email using Gmail API and nodemailer
async function sendEmail(auth, { from, to, subject, text, attachments }) {
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
    from: `Saywa <${from}>`,
    to,
    subject,
    html: text,
    attachments,
  };

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

// Email handler function
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

// Email handler function with attachments
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
