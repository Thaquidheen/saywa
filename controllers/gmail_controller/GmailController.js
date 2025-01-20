const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

// Define the path for credentials and token
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const TOKEN_PATH = path.join(process.cwd(), "gmail_token.json");
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

// Load client secrets from a local file and authorize the client
async function authorize() {
  const content = fs.readFileSync(CREDENTIALS_PATH);

  const { client_secret, client_id, redirect_uris } = JSON.parse(content).web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    const token = fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch (err) {
    return getNewToken(oAuth2Client);
  }
}

// Get a new token if it doesn't exist
function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
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
    to: to, // Recipient email
    subject: subject,
    html: text,
    attachments,
  };

  // Send mail
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error: " + error);
        reject("Email sending failed");
      }
      console.log("Email sent: " + info.response);
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
    return error;
  }
}

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
    return error;
  }
}

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
    return error;
  }
}

module.exports = {
  handleSendEmail,
  handleSendEmailAttachment,
};
