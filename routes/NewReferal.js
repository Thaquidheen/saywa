const express = require("express");
const routes = express.Router();
const RFERAL_SCHEMA = require("../models/Referals");
const voucher_codes = require("voucher-code-generator");
const nodemailer = require("nodemailer");
const CUSTOMER = require("../models/Customers");
const {
  handleSendEmail,
} = require("../controllers/gmail_controller/GmailController");

// routes.post("/new-referal", async (req, res) => {
//   try {
//     const voucher = voucher_codes.generate({
//       length: 8,
//     });

//     // Fetch the referring user's full name
//     const customer = await CUSTOMER.findOne({ user_id: req.body.cid });
//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     const custFullName = customer.fullName; // Fetch the customer's full name

//     const query = {
//       user_id: req.body.cid, // Ensure the user ID is part of the query
//       refered_email: req.body.email,
//     };

//     // Check if a referral already exists for the same user and email
//     const result = await RFERAL_SCHEMA.find(query);
//     console.log("Query for existing referral:", query);
// console.log("Existing referral result:", result);
//     if (result.length === 0) {
//       const newReferal = new RFERAL_SCHEMA({
//         user_id: req.body.cid,
//         refered_email: req.body.email,
//         referal_code: voucher[0],
//         amount: 25,
//       });

//       // Send referral email
//       sendReferalMail(req.body.email, voucher[0], custFullName);

//       // Save the referral to the database
//       await newReferal.save();

//       return res.status(200).json({ message: "Referral created successfully" });
//     } else {
//       // Referral already exists
//       return res.status(409).json({ message: "Referral already exists" });
//     }
//   } catch (error) {
//     console.error("Error in /new-referal:", error);
//     return res.status(500).json({ message: "Internal Server Error", error });
//   }
// });

routes.post("/new-referal", async (req, res) => {
  try {
    const voucher = voucher_codes.generate({
      length: 8,
    });

    // Fetch customer data
    const customer = await CUSTOMER.findOne({ user_id: req.body.cid });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const custFullName = customer.fullName;

    // Check for existing referral
    const query = {
      user_id: req.body.cid,
      refered_email: req.body.email,
    };

    const result = await RFERAL_SCHEMA.find(query);
    if (result.length === 0) {
      const newReferal = new RFERAL_SCHEMA({
        user_id: req.body.cid,
        refered_email: req.body.email,
        referal_code: voucher[0],
        amount: 25,
      });

      sendReferalMail(req.body.email, voucher[0], custFullName);
      await newReferal.save();

      return res.status(200).json({ message: "Referral created successfully" });
    } else {
      // Referral already exists
      return res.status(409).json({ message: "Referral already exists" });
    }
  } catch (error) {
    console.error("Error in /new-referal:", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
});

const sendReferalMail = async (email, voucher_code, custFullName) => {
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

  const mailOptions = {
    from: `"Saywa" <${process.env.CONTACT_EMAIL}>`,
    to: email,
    subject: "Invitation to Join Saywa",
    text: `<table
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
                                      Invitation to Join Saywa
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
                                              <p style="margin: 0 0">
                                                  Dear User,
                                              </p>
                                              <p style="text-align:justify">You've been invited by ${custFullName} to join <b>Saywa</b>. Sign up using the link below:
                                              </p>
                                              
                                              <p>Referal Code : <b>${voucher_code}</b></p>

                                              <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a>
                                              <p style="text-align:justify">
                                              </p>
                                              <p>
                                              <p>Safe travels!</p>
                                              <p>
                                                Best regards,<br />Saywa Limo
                                              </p>
  
                                              <br />
                                               <div>
                                            <b>About Saywa</b><br/>
                                            <p style="text-align:justify">
Seattle’s premier luxury transportation provider specializing exclusively in airport transfers. Established in 2023, Saywa has built a solid reputation as the leading choice for limousine and luxury transportation services in Seattle.</p>
											<p style="text-align:justify"> Our services are tailored specifically for airport transfers, ensuring a seamless and luxurious experience for our clients. With a focus on corporate travel and special events, Saywa offers sleek and stylish vehicles paired with exceptional service and attention to detail. Choose Saywa for a truly extraordinary and memorable transportation experience.</p>
                                            <p>

<p>TRAVEL:<br/></p>

<p>Luxury Transportation Services | Saywa: Explore Destinations in Style</p>
											<p style="text-align:justify">
                                            Discover seamless travel experiences with Saywa’s luxury transportation services. Whether for corporate events, special celebrations, or reliable transportation needs, trust Saywa to take you in comfort and style. From bustling city centers to serene countryside retreats, Saywa is your trusted partner for exploring diverse destinations effortlessly. Begin your journey with Saywa and experience travel redefined.</p>

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

  handleSendEmail(mailOptions);

  // await transporter.sendMail(mailOptions);
};

routes.post("/get-offers", async (req, res) => {
  try {
    const result = [];
    const query = { user_id: req.body.cid };

    const customerData = await CUSTOMER.find(query);
    const referalQuery = {
      refered_email: customerData[0]?.email,
      status: "not-used",
    };
    const vouchers = await RFERAL_SCHEMA.find(referalQuery);

    return res.status(200).json([customerData[0], vouchers]);
  } catch (error) {
    return res.status(500).json(error);
  }
});
routes.post("/apply-referal", async (req, res) => {
  try {
    const { userId, referalCode } = req.body;

    // Validate the referral code
    const referral = await RFERAL_SCHEMA.findOne({
      referal_code: referalCode,
      status: "not-used",
    });

    if (!referral) {
      return res.status(400).json({ message: "Invalid or used referral code." });
    }

    // Apply the referral benefit (e.g., add wallet balance or discount)
    const customer = await CUSTOMER.findOne({ user_id: userId });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const updatedWalletBalance = customer.wallet_balance + referral.amount;

    // Update customer's wallet balance
    await CUSTOMER.updateOne(
      { user_id: userId },
      { $set: { wallet_balance: updatedWalletBalance } }
    );

    // Mark the referral code as used
    await RFERAL_SCHEMA.updateOne(
      { referal_code: referalCode },
      { $set: { status: "used" } }
    );

    return res.status(200).json({
      message: "Referral applied successfully.",
      updatedWalletBalance,
    });
  } catch (error) {
    console.error("Error applying referral:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});
routes.post("/complete-action", async (req, res) => {
  try {
    const { email } = req.body; 

    // Find the referral
    const referral = await RFERAL_SCHEMA.findOne({
      refered_email: email,
      status: "not-used",
    });

    if (!referral) {
      return res.status(404).json({ message: "No valid referral found." });
    }

    // Add the amount to the referrer's wallet
    const referrer = await CUSTOMER.findOne({ user_id: referral.user_id });
    if (!referrer) {
      return res.status(404).json({ message: "Referrer not found." });
    }

    referrer.wallet_balance += referral.amount;

    // Save updates
    await referrer.save();

    // Update referral status to 'used'
    referral.status = "used";
    await referral.save();

    return res.status(200).json({ message: "Referral bonus added to wallet." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred.", error });
  }
});


module.exports = routes;
