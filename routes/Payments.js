require("dotenv").config();
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_KEY);

// Mongoose models
const Trips = require("../models/Trips");
const CUSTOMERMODAL = require("../models/Customers");
const REFERALS = require("../models/Referals");
const Vehicle = require("../models/Vehicles");
const Customers = require("../models/Customers");

// Gmail controller
const {
  handleSendEmail,
  handleSendEmailAttachment,
} = require("../controllers/gmail_controller/GmailController");

// PDF generation
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Google auth (if needed for calendar)
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const processs = require("process");

// ---------------------------------------------------------
//  1) Define the Stripe webhook route with express.raw()
// ---------------------------------------------------------
router.post("/webhook",
  express.raw({ type: "application/json" }), // <-- Raw body for Stripe
  async (req, res) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK;
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      // IMPORTANT: pass req.body (the raw Buffer) to constructEvent
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        // ---------------------------------------------------------
        // 2) Extract trip data from session.metadata
        // ---------------------------------------------------------
        const {
          no,
          tripNo,
          source,
          destination = "",
          vehicleId,
          customerId,
          customerName = "",
          rideType,
          scheduledDate,
          scheduledTime = "",
          totalAmount,
          stops,
          paymentMode = "Card",
          noOfPassengers = "1",
          documents = "[]",
          noOfBags,
          meetAndGreet,
          tripOccasion,
          tripOccasionDetails,
          totalKms,
          totalHours,
          bagType,
          flightInformation,
          needCarSeat,
          seatCount,
          additionalInfo,
          gratuiryTypeCash,
          gratuityAmount,
          returnDate,
          returnTime,
          returnMeetAndGreet,
          returnGratuity,
          returnSeats,
          returnAdditionalInfo,
          returnTotalKms,
          returnBagType,
          returnCarryOnBagsCount,
          returnCheckedBagCount,
          returnNeedWheelChair,
          returnDiscount,
        } = session.metadata;

        console.log("Metadata received:", session.metadata);

        // Parse stops
        let parsedStops = [];
        try {
          parsedStops = JSON.parse(stops || "[]");
          console.log("Parsed stops:", parsedStops);
        } catch (parseError) {
          console.error("Error parsing stops:", parseError);
        }

        // Parse documents
        let parsedDocuments = [];
        try {
          parsedDocuments = JSON.parse(documents || "[]");
          console.log("Parsed documents:", parsedDocuments);
        } catch (parseError) {
          console.error("Error parsing documents:", parseError);
        }

        // ---------------------------------------------------------
        // 3) Create and save the trip in MongoDB
        // ---------------------------------------------------------
        const tripCount = (await Trips.find()).length;
        const tripDoc = new Trips({
          no: tripCount + 1,
          tripNo,
          source,
          destination,
          vehicleId,
          customerId,
          customerName,
          rideType,
          scheduledDate,
          scheduledTime,
          totalAmount: parseFloat(totalAmount),
          stops: parsedStops,
          paymentMode,
          noOfPassengers,
          documents: parsedDocuments,
          tripStatus: "Confirmed",
          paymentStatus: "Completed",
          paymentId: session.payment_intent,
          paymentReference: session.id,
          noOfBags,
          meetAndGreet,
          tripOccasion,
          tripOccasionDetails,
          totalKms,
          totalHours,
          bagType,
          flightInformation,
          needCarSeat,
          seatCount,
          additionalInfo,
          gratuiryTypeCash,
          gratuityAmount,
          returnDate,
          returnTime,
          returnMeetAndGreet,
          returnGratuity,
          returnSeats,
          returnAdditionalInfo,
          returnTotalKms,
          returnBagType,
          returnCarryOnBagsCount,
          returnCheckedBagCount,
          returnNeedWheelChair,
          returnDiscount,
        });

        const savedTrip = await tripDoc.save();
        console.log(`Trip created successfully for payment session ${session.id}`);

        // ---------------------------------------------------------
        // 4) Send Emails or Notifications
        // ---------------------------------------------------------
        await sendTripSuccessMailToClient(savedTrip);
        await sendTripSuccessMailToAdmin(savedTrip);

        // Handle referral logic
        try {
          const refererEmail = await handleReferralCompletion(
            customerId,
            savedTrip._id,
            totalAmount
          );
          console.log(`Referral wallet updated for referer: ${refererEmail}`);
        } catch (referralError) {
          console.error(
            "Error handling referral completion:",
            referralError.message
          );
        }

        return res.status(200).json({ received: true });
      } catch (error) {
        console.error("Error creating trip from webhook:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    } else {
      // Other event types
      return res.status(200).json({ received: true });
    }
  }
);

// ---------------------------------------------------------
// Referral handling
// ---------------------------------------------------------
const handleReferralCompletion = async (customerId, tripId, totalAmount) => {
  try {
    // Query the customer by 'user_id'
    const customer = await Customers.findOne({ user_id: customerId });
    if (!customer) {
      throw new Error("Customer not found");
    }

    const referredEmail = customer.email;
    console.log("Referred Email from customer:", referredEmail);

    // Find a referral record for that email
    const referral = await REFERALS.findOne({
      refered_email: referredEmail,
      status: "not-used",
    });
    console.log("Found Referral:", referral);

    if (referral) {
      // Update referral status, attach the tripId
      await REFERALS.updateOne(
        { _id: referral._id },
        { status: "used", tripId }
      );

      // Update the referrer's wallet
      await Customers.updateOne(
        { user_id: referral.user_id },
        { $inc: { wallet_balance: 25 } }
      );

      return referral.user_id;
    }

    return null; // No referral found
  } catch (error) {
    console.error("Error handling referral completion:", error.message);
    throw error;
  }
};

// ---------------------------------------------------------
// Send Email to Client
// ---------------------------------------------------------
async function sendTripSuccessMailToClient(tripData) {
  try {
    // Find the customer in the database
    const custData = await Customers.find({ user_id: tripData.customerId }).limit(1);
    if (!custData[0] || !custData[0].email) {
      console.error("Customer email not found.");
      return;
    }

    const emailBody = `
      Dear ${custData[0].fullName},<br/><br/>
      Thank you for riding with Saywa!
      <br/><br/>
      <strong>Trip Details:</strong>
      <ul>
        <li>Trip No: ${tripData.tripNo}</li>
        <li>From: ${tripData.source}</li>
        <li>To: ${tripData.destination || "N/A"}</li>
        <li>Date: ${tripData.scheduledDate}</li>
        <li>Time: ${tripData.scheduledTime}</li>
        <li>Total Amount: $${parseFloat(tripData.totalAmount).toFixed(2)}</li>
      </ul>
      <br/>
      We hope you had a pleasant experience. If you have any questions, please reply to this email.
      <br/><br/>
      Best regards,<br/>
      <strong>Saywa Team</strong>
    `;

    await handleSendEmail({
      to: custData[0].email,
      subject: "Thank You for Riding with Saywa!",
      text: emailBody,
    });

    console.log("Client confirmation email sent via Gmail OAuth2!");
  } catch (error) {
    console.error("Error in sendTripSuccessMailToClient:", error);
    throw error;
  }
}

// ---------------------------------------------------------
// Send Email to Admin
// ---------------------------------------------------------
async function sendTripSuccessMailToAdmin(tripData) {
  try {
    const custDatax = await CUSTOMERMODAL.find({ user_id: tripData.customerId });
    const adminEmailBody = `
      <h1>New Booking Received</h1>
      <p>Dear Admin, you have a new booking from ${tripData.customerName}</p>
      <ul>
        <li>Trip Type: ${tripData.rideType}</li>
        <li>Departure: ${tripData.source}</li>
        <li>Destination: ${tripData.destination}</li>
        <li>Date & Time: ${tripData.scheduledDate}, ${tripData.scheduledTime}</li>
      </ul>
      <p>Please log in to the admin panel to view more details.</p>
    `;

    await handleSendEmail({
      to: `${process.env.ADMIN_MAIL},${process.env.CONTACT_EMAIL}`,
      subject: "New Trip Received",
      text: adminEmailBody,
    });

    console.log("Admin notification sent via Gmail OAuth2!");
  } catch (error) {
    console.error("Error in sendTripSuccessMailToAdmin:", error);
    throw error;
  }
}

// ---------------------------------------------------------
// Optional Calendar / PDF Code
// ---------------------------------------------------------
const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = path.join(processs.cwd(), "tokenx.json");
const CREDENTIALS_PATH = path.join(processs.cwd(), "google_cal.json");

// (Google Auth methods if you need them)
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.promises.readFile(TOKEN_PATH, "utf8");
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.promises.readFile(CREDENTIALS_PATH, "utf8");
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.promises.writeFile(TOKEN_PATH, payload);
}

async function authorize(tripdata) {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

// ---------------------------------------------------------
// Invoice generation (if you need it)
// ---------------------------------------------------------
async function generateInvoice(customer, tripData, custData) {
  const doc = new PDFDocument();
  const pdfPath = path.join(__dirname, "invoice.pdf");

  doc.pipe(fs.createWriteStream(pdfPath));

  const logoimage = path.join(__dirname, "logo.png");
  doc
    .fillColor("#444444")
    .image(logoimage, 55, 57, { width: 100 })
    .moveDown();
  doc
    .fillColor("#444444")
    .fontSize(10)
    .text("3009 Bridgeport Way West", 55, 105)
    .text("Tacoma, WA 98466", 55, 118)
    .text("reservations@saywalimo.com", 55, 131)
    .text("877-206-0780", 55, 144)
    .moveDown();

  doc
    .fillColor("#000000")
    .fontSize(20)
    .text("INVOICE", 50, 180, { align: "center" });
  generateHr(doc, 200);

  const customerInformationTop = 220;

  doc
    .fontSize(10)
    .text("Invoice no:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(customer[0]?.tripNo, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(
      new Date(tripData.created_at).toLocaleDateString(),
      150,
      customerInformationTop + 15
    )
    .text("Bill to:", 300, customerInformationTop)
    .font("Helvetica-Bold")
    .text(tripData.customerName, 350, customerInformationTop)
    .font("Helvetica")
    .text(custData.email, 350, customerInformationTop + 14)
    .text(custData.contact_no, 350, customerInformationTop + 28)
    .moveDown();

  const invoiceTableTop = 230;

  doc
    .font("Helvetica-Bold")
    .text("#", 50, invoiceTableTop + 60)
    .text("Quantity", 75, invoiceTableTop + 60)
    .text("Description", 125, invoiceTableTop + 60)
    .text("Price", 325, invoiceTableTop + 60, { align: "right" });
  generateHr(doc, invoiceTableTop + 80);

  const destination =
    customer[0]?.rideType === "hourly-trip"
      ? ""
      : ` to ${customer[0]?.destination}`;

  const onewayTrip = `Transfer Ride starting at ${customer[0]?.scheduledDate},
    ${customer[0]?.scheduledTime} from ${customer[0]?.source}${destination}`;

  doc
    .font("Helvetica")
    .text("1", 70, invoiceTableTop + 90)
    .text("1", 95, invoiceTableTop + 90)
    .text(onewayTrip, 125, invoiceTableTop + 90, { align: "left" })
    .text(
      "$" + parseInt(customer[0]?.totalAmount),
      300,
      invoiceTableTop + 90,
      { align: "right" }
    );

  doc.end();
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

// Export the router
module.exports = router;
