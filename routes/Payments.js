const stripe = require("stripe")(process.env.STRIPE_KEY);
const express = require("express");
const Trips = require("../models/Trips");
const CUSTOMERMODAL = require("../models/Customers");
const VEHICLES = require("../models/Vehicles");
const nodemailer = require("nodemailer");
const REFERALS = require("../models/Referals");
const Vehicle = require("../models/Vehicles");

const PDFDocument = require("pdfkit");

// Use express.raw() to get the raw request body


const fs = require('fs');

const path = require("path");
const processs = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
const Customers = require("../models/Customers");
const router = express.Router();
  router.post("/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
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

async function sendTripSuccessMailToClient(tripData) {
  try {
    // Retrieve customer details using the trip's customer ID
    const custData = await Customers.find({ user_id: tripData.customerId }).limit(1);
    if (!custData[0] || !custData[0].email) {
      console.error("Customer email not found.");
      return;
    }

    // Build a simple plain text message with basic trip details.
    const emailBody = `
Dear ${custData[0].fullName},

Thank you for riding with Saywa!

Here are your trip details:
- Trip No: ${tripData.tripNo}
- From: ${tripData.source}
- To: ${tripData.destination || "N/A"}
- Date: ${tripData.scheduledDate}
- Time: ${tripData.scheduledTime}
- Total Amount: $${parseFloat(tripData.totalAmount).toFixed(2)}

We hope you had a pleasant experience. If you have any questions or need further assistance, please reply to this email.

Best regards,
Saywa Team
    `;

    // Build mail options without any attachments
    const mailOptions = {
      from: `"Saywa" <${process.env.CONTACT_EMAIL}>`,
      to: custData[0].email,
      subject: "Thank You for Riding with Saywa!",
      text: emailBody,
    };

    // Create transporter and send email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      host: process.env.EMAIL_HOST_NAME,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.AUTH_EMAIL_USER,
        pass: process.env.AUTH_EMAIL_PASSWORD,
      },
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error in sendTripSuccessMailToClient:", error);
    throw error;
  }
}
  
async function sendTripSuccessMailToAdmin(tripData) {
  const custDatax = await CUSTOMERMODAL.find({
    user_id: tripData.customerId,
  });
  
  // mail setup
  let transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST_NAME,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.AUTH_EMAIL_USER,
      pass: process.env.AUTH_EMAIL_PASSWORD,
    },
  });

  // const query = { paymentId: paymentID };
  // const tripData = await Trips.find(query).limit(1);

  //   Mail Data
  const mailOptions = {
    from: `"Saywa Limo" <${process.env.NO_REPLY}>`,
    to: `${process.env.ADMIN_MAIL},${process.env.CONTACT_EMAIL}`,
    subject: "New trip received",
    html: `<table
    width="100%"
    id="m_-4521581668634247801outer_wrapper"
    style="background-color: #f7f7f7"
    bgcolor="#f7f7f7"
  >
    <tbody>
      <tr>
        <td></td>
        <td width="600">
          <div
            id="m_-4521581668634247801wrapper"
            dir="ltr"
            style="margin: 0 auto; padding: 70px 0; width: 100%; max-width: 600px"
            width="100%"
          >
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              height="100%"
              width="100%"
            >
              <tbody>
                <tr>
                  <td align="center" valign="top">
                    <div id="m_-4521581668634247801template_header_image"></div>
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      id="m_-4521581668634247801template_container"
                      style="
                        background-color: #fff;
                        border: 1px solid #dedede;
                        border-radius: 3px;
                      "
                      bgcolor="#fff"
                    >
                      <tbody>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_header"
                              style="
                                background-color: #000000;
                                color: #fff;
                                border-bottom: 0;
                                font-weight: bold;
                                line-height: 100%;
                                vertical-align: middle;
                                font-family: 'Helvetica Neue', Helvetica, Roboto,
                                  Arial, sans-serif;
                                border-radius: 3px 3px 0 0;
                              "
                              bgcolor="#0c9991"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    id="m_-4521581668634247801header_wrapper"
                                    style="padding: 36px 48px; display: block"
                                  >
                                    <h1
                                      style="
                                        font-family: 'Helvetica Neue', Helvetica,
                                          Roboto, Arial, sans-serif;
                                        font-size: 30px;
                                        font-weight: 300;
                                        line-height: 150%;
                                        margin: 0;
                                        text-align: left;
                                        color: #fff;
                                        background-color: inherit;
                                      "
                                      bgcolor="inherit"
                                    >
                                      New Booking
                                    </h1>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" valign="top">
                            <table
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              width="100%"
                              id="m_-4521581668634247801template_body"
                            >
                              <tbody>
                                <tr>
                                  <td
                                    valign="top"
                                    id="m_-4521581668634247801body_content"
                                    style="background-color: #fff"
                                    bgcolor="#fff"
                                  >
                                    <table
                                      border="0"
                                      cellpadding="20"
                                      cellspacing="0"
                                      width="100%"
                                    >
                                      <tbody>
                                        <tr>
                                          <td
                                            valign="top"
                                            style="padding: 48px 48px 32px"
                                          >
                                            <div
                                              id="m_-4521581668634247801body_content_inner"
                                              style="
                                                color: #636363;
                                                font-family: 'Helvetica Neue',
                                                  Helvetica, Roboto, Arial,
                                                  sans-serif;
                                                font-size: 14px;
                                                line-height: 150%;
                                                text-align: left;
                                              "
                                              align="left"
                                            >
                                            <p>Dear ${custDatax[0].fullName},</p>
                                              <p style="margin: 0 0">
                                                Thank you for your booking. We will provide you with regular updates on the status of your trip.
                                              </p>
                                              <br />
                                              <h2
                                                style="
                                                  color: #00000;
                                                  display: block;
                                                  font-family: 'Helvetica Neue',
                                                    Helvetica, Roboto, Arial,
                                                    sans-serif;
                                                  font-size: 18px;
                                                  font-weight: bold;
                                                  line-height: 130%;
                                                  margin: 0 0;
                                                  text-align: left;
                                                  margin-bottom:10px
                                                "
                                              >
                                                Trip Information

                                              </h2>
                                              
                                              <ul>
                                              <li>
                                              Passenger Name: ${tripData.customerName}
                                              </li>
                                              <li>
                                                Trip Type: ${tripData.rideType}
                                              </li>
                                              <li>
                                                Departure :  ${tripData.source} 
                                                  </li>
                                         
                                             <li>
                                                Destination: ${tripData.destination}
                                              </li> 
                                              <li>
                                                Departure Time : ${tripData.scheduledDate}, ${tripData.scheduledTime} 
                                              </li>
                                              </ul>
                                             
                                            
  
                                              <p></p>
                                              <div
                                                style="
                                                  display: flex;
                                                  justify-content: center;
                                                "
                                              >
                                                <a
                                                  href="https://admin.saywalimo.com/trip_action/${tripData._id}"
                                                  style="
                                                    text-decoration: none;
                                                    color: #ffffff;
                                                  "
                                                  ><div
                                                    style="
                                                      background: #c19b65;
                                                      padding: 10px;
                                                      border-radius: 10px;
                                                      width: 200px;
                                                      text-align: center;
                                                    "
                                                  >
                                                    <strong>View trip</strong>
                                                  </div></a
                                                >
                                              </div>
                                            </div>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </td>
        <td></td>
      </tr>
    </tbody>
  </table>
  `,
  };

  //   Send Action
  transporter.sendMail(mailOptions);
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
