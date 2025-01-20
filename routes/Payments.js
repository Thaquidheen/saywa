const stripe = require("stripe")(process.env.STRIPE_KEY);
const express = require("express");
const Trips = require("../models/Trips");
const CUSTOMERMODAL = require("../models/Customers");
const VEHICLES = require("../models/Vehicles");
const nodemailer = require("nodemailer");
const REFERALS = require("../models/Referals");
const Vehicle = require("../models/Vehicles");
const {
  handleSendEmail,
  handleSendEmailAttachment,
} = require("../controllers/gmail_controller/GmailController");
const PDFDocument = require("pdfkit");

// Use express.raw() to get the raw request body


const fs = require('fs');

const path = require("path");
const processs = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const Customers = require("../models/Customers");
const router = express.Router();
router.use(express.raw({ type: "application/json" }));
  router.post("/webhook", async (req, res) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK;
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      try {
        // Extract trip data from session metadata
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
      let parsedStops = [];
      try {
        parsedStops = JSON.parse(stops || "[]");
        console.log("Parsed stops:", parsedStops);
      } catch (parseError) {
        console.error("Error parsing stops:", parseError);
      }

      // Safely parse documents
      let parsedDocuments = [];
      try {
        parsedDocuments = JSON.parse(documents || "[]");
        console.log("Parsed documents:", parsedDocuments);
      } catch (parseError) {
        console.error("Error parsing documents:", parseError);
      }
      const tripCount = (await Trips.find()).length;
        // Create and save the trip in MongoDB
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

        // Optionally, send confirmation emails or notifications
        await sendTripSuccessMailToClient(savedTrip);
        await sendTripSuccessMailToAdmin(savedTrip);

        try {
          const refererEmail = await handleReferralCompletion(customerId, savedTrip._id, totalAmount);
          console.log(`Referral wallet updated for referer: ${refererEmail}`);
        } catch (referralError) {
          console.error("Error handling referral completion:", referralError.message);
        }
  
        res.status(200).json({ received: true });
      } catch (error) {
        console.error("Error creating trip from webhook:", error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    } else {
      res.status(200).json({ received: true });
    }
  });
  // const handleReferralCompletion = async (customerId, tripId, totalAmount) => {
  //   // Find the customer using the provided customerId
  //   const customer = await Customers.findById(customerId);
  
  //   if (!customer) {
  //     throw new Error("Customer not found");
  //   }
  
  //   const referredEmail = customer.email;
  
  //   // Check if the customer was referred
  //   const referral = await RFERAL_SCHEMA.findOne({
  //     refered_email: referredEmail,
  //     status: "not-used",
  //   });
  
  //   if (referral) {
  //     // Update the referral status and credit the wallet of the referrer
  //     await RFERAL_SCHEMA.updateOne(
  //       { _id: referral._id },
  //       { status: "used", tripId }
  //     );
  
  //     await CUSTOMER.updateOne(
  //       { _id: referral.user_id },
  //       { $inc: { wallet_balance: 25 } }
  //     );
  
  //     return referral.user_id; // Return the email of the referrer
  //   }
  
  //   return null; // No referral found
  // };



  // const handleReferralCompletion = async (customerId, tripId, totalAmount) => {
  //   try {

  //     const customer = await Customers.findOne({ user_id: customerId });
  
  //     if (!customer) {
  //       throw new Error("Customer not found");
  //     }
  
  //     const referredEmail = customer.email;
  
  //     // Check if the customer was referred
  //     const referral = await REFERALS.findOne({
  //       refered_email: referredEmail,
  //       status: "not-used",
  //     });
  
  //     if (referral) {
  //       // Update the referral status and credit the wallet of the referrer
  //       await REFERALS.updateOne(
  //         { _id: referral._id },
  //         { status: "used", tripId }
  //       );
  
  //       await Customers.updateOne(
  //         { user_id: referral.user_id },
  //         { $inc: { wallet_balance: 25 } }
  //       );
  
  //       return referral.user_id; // Return the referrer's ID
  //     }
  
  //     return null; // No referral found
  //   } catch (error) {
  //     console.error("Error handling referral completion:", error.message);
  //     throw error;
  //   }
  // };
  const handleReferralCompletion = async (customerId, tripId, totalAmount) => {
    try {
      // Query the customer by 'user_id' (assuming customerId is the string ID stored in Customers)
      const customer = await Customers.findOne({ user_id: customerId });
      if (!customer) {
        throw new Error("Customer not found");
      }
  
      const referredEmail = customer.email;
      console.log("Referred Email from customer:", referredEmail);
  
      // Find a referral record where refered_email equals the customer's email and status is 'not-used'
      const referral = await REFERALS.findOne({
        refered_email: referredEmail,
        status: "not-used",
      });
      console.log("Found Referral:", referral);
  
      if (referral) {
        // Update referral status and attach the tripId to the referral record
        await REFERALS.updateOne(
          { _id: referral._id },
          { status: "used", tripId }
        );
  
        // Use the 'user_id' field (a string) rather than '_id' to update the referrer's wallet balance
        await Customers.updateOne(
          { user_id: referral.user_id },
          { $inc: { wallet_balance: 25 } }
        );
  
        return referral.user_id; // Return the referrer's user_id
      }
  
      return null; // No referral found
    } catch (error) {
      console.error("Error handling referral completion:", error.message);
      throw error;
    }
  };
  
  function convertDateTimeToISO(date, time) {
  const zeroPad = (num, places) => String(num).padStart(places, "0");

  const newDate = date.split("-");
  const timeWithoutAMPM = time.split(" ");

  var newHour = "";
  var tempnewHour = timeWithoutAMPM[0].split(":");
  var newTime = tempnewHour[1];
  if (timeWithoutAMPM[1] === "PM") {
    newHour = zeroPad(parseInt(tempnewHour[0]) + 12, 2);
  } else {
    newHour = zeroPad(parseInt(tempnewHour[0]), 2);
  }
  return `${newDate[2]}-${newDate[0]}-${
    parseInt(newDate[1]) - 1
  }T${newHour}:${newTime}:00-07:00`;
}
// async function sendTripSuccessMailToClient(tripData) {
//   try {
//     // Prepare data: find trip details and customer details
//     const customer = await Trips.find({ _id: tripData._id }).limit(1);
//     const custData = await Customers.find({ user_id: tripData.customerId }).limit(1);
    
//     // Generate the invoice before sending the email
//     await generateInvoice(customer, tripData, custData);
//     console.log(custData)
//     console.log( 'this is trip data ' ,tripData)
  
//     // Build mail options
//     const mailOptions = {
//       from: `"Saywa" <${process.env.CONTACT_EMAIL}>`,
//       to: custData[0]?.email,
//       subject: "Thank You for Riding with Saywa!",
//       text: "Your trip details are attached.",
//       attachments: [
//         {
//           filename: "invoice.pdf",
//           path: path.join(__dirname, "invoice.pdf"),
//           contentType: "application/pdf",
//         },
//       ],
//     };
    
//     // Create transporter and send email
//     const transporter = nodemailer.createTransport({
//       service: process.env.EMAIL_SERVICE,
//       host: process.env.EMAIL_HOST_NAME,
//       port: process.env.EMAIL_PORT,
//       secure: true,
//       auth: {
//         user: process.env.AUTH_EMAIL_USER,
//         pass: process.env.AUTH_EMAIL_PASSWORD,
//       },
//     });
    
//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully:", info.response);
    
//     // Optionally, delete the invoice file after sending the email
//     fs.unlink(path.join(__dirname, "invoice.pdf"), (err) => {
//       if (err) {
//         console.error("Error deleting invoice.pdf:", err);
//       } else {
//         console.log("Invoice.pdf deleted successfully.");
//       }
//     });
    
//   } catch (error) {
//     console.error("Error in sendTripSuccessMailToClient:", error);
//     throw error;
//   }
// }

// In your sendTripSuccessMailToClient function:
async function sendTripSuccessMailToClient(tripData) {
  try {
    // Retrieve the customer's record
    const custData = await Customers.find({ user_id: tripData.customerId }).limit(1);

    if (!custData[0] || !custData[0].email) {
      console.error("Customer email not found.");
      return;
    }

    // Prepare the email body (HTML or simple text).
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

    // Now use handleSendEmail from gmailController.js
    await handleSendEmail({
      to: custData[0].email,
      subject: "Thank You for Riding with Saywa!",
      text: emailBody, // or "html": emailBody if you prefer renaming
    });

    console.log("Client confirmation email sent via Gmail OAuth2!");
  } catch (error) {
    console.error("Error in sendTripSuccessMailToClient:", error);
    throw error;
  }
}

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
        <li>Date &amp; Time: ${tripData.scheduledDate}, ${tripData.scheduledTime}</li>
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


const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = path.join(processs.cwd(), "tokenx.json");
const CREDENTIALS_PATH = path.join(processs.cwd(), "google_cal.json");
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
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



const generateInvoice = async (customer, tripData, custData) => {
  const doc = new PDFDocument();
  const pdfPath = path.join(__dirname, "invoice.pdf");

  doc.pipe(fs.createWriteStream(pdfPath));

  const logoimage = path.join(__dirname, "logo.png");
  doc
    .fillColor("#444444")
    .image(`${logoimage}`, 55, 57, { width: 100 })
    .moveDown();
  doc
    .fillColor("#444444")
    .fontSize(20)
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

  const onewayTrip =
    "Transfer Ride starting at " +
    customer[0]?.scheduledDate +
    ", " +
    customer[0]?.scheduledTime +
    " from " +
    customer[0]?.source +
    destination;
  doc
    .font("Helvetica")
    .text("1", 70, invoiceTableTop + 90)
    .text("1", 95, invoiceTableTop + 90)
    .text(onewayTrip, 125, invoiceTableTop + 90, { align: "left" })
    .text("$" + parseInt(customer[0]?.totalAmount), 300, invoiceTableTop + 90, {
      align: "right",
    });

  doc.end();

  const fileName = "invoice.pdf";
};

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}
function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}



module.exports = router;
