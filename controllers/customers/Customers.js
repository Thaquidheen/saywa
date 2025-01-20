const asyncHandler = require("express-async-handler");
const Customers = require("../../models/Customers");
const nodemailer = require("nodemailer");

const { handleSendEmail } = require("../gmail_controller/GmailController");
const { response } = require("express");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const signUpWithEmail = asyncHandler(async (req, res) => {
  const customer = await stripe.customers.create({
    name: req.body.fullName,
    email: req.body.email,
    phone: req.body.contactNumber,
  });

  const new_customer = new Customers({
    user_id: req.body.uid,
    stripeId: customer.id,
    fullName: req.body.fullName,
    email: req.body.email,
    contact_no: req.body.contactNumber,
  });
  try {
    await new_customer
      .save()
      .then((response) => {
        const mailData = `<table
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
                                    Account Created
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
                                               
                                                 <p>Dear ${req.body.fullName},</p>
          <p>Your account has been successfully created. Welcome to Saywa Limo! We are excited to have you on board.</p>
         
           
          <p>Thank you for choosing Saywa Limo. If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:${process.env.CONTACT_EMAIL}">${process.env.CONTACT_EMAIL}</a>.</p>
          <p>Best regards,<br>Saywa Limo</p>
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
  </table>`;

        const emailData = {
          from: "bookings@fluffnfolde.com",
          to: req.body.email,
          subject: "Account Created",
          text: `<div>${mailData}<div>`,
        };

        handleSendEmail(emailData);
        return res.status(200).json({
          data: response,
        });
      })
      .catch((err) => {
        console.log(err);

        return res.status(500).json({
          message: err,
        });
      });
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
});

const adminSignUpWithEmail = asyncHandler(async (req, res) => {
  const customer = await stripe.customers.create({
    name: req.body.fullName,
    email: req.body.email,
    phone: req.body.contactNumber,
  });

  const new_customer = new Customers({
    user_id: req.body.uid,
    stripeId: customer.id,
    fullName: req.body.fullName,
    email: req.body.email,
    contact_no: req.body.contactNumber,
  });
  try {
    await new_customer
      .save()
      .then((response) => {
        // mail setup

        const mailData = `<table
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
                                    Account Created
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
                                               
                                                 <p>Dear ${req.body.fullName},</p>
          <p>Your account has been successfully created. Welcome to Saywa Limo! We are excited to have you on board.</p>
           
          <p>Thank you for choosing Saywa Limo. If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:${process.env.CONTACT_EMAIL}">${process.env.CONTACT_EMAIL}</a>.</p>
          <p>Best regards,<br>Saywa Limo</p>
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
  </table>`;

        const emailData = {
          from: "bookings@fluffnfolde.com",
          to: req.body.email,
          subject: "Account Created",
          text: `<div>${mailData}<div>`,
        };

        handleSendEmail(emailData);
        return res.status(200).json({
          data: response,
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json({
          message: err,
        });
      });
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
});

const signUpWithGoogle = asyncHandler(async (req, res) => {
  const matchQuery = {
    email: req.body.email,
  };

  try {
    const checkExists = await Customers.find(matchQuery);

    if (checkExists.length === 0) {
      const customer = await stripe.customers.create({
        name: req.body.fullName,
        email: req.body.email,
        phone: req.body.phoneNumber,
      });

      const new_customer = new Customers({
        user_id: req.body.uid,
        stripeId: customer.id,
        fullName: req.body.fullName,
        email: req.body.email,
        contact_no: req.body.phoneNumber,
        userImage: req.body.userImage,
      });
      const data = await new_customer.save();

      console.log(data);

      const mailData = `<table
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
                                    Account Created
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
                                               
                                                 <p>Dear ${req.body.fullName},</p>
          <p>Your account has been successfully created. Welcome to Saywa Limo! We are excited to have you on board.</p>
         
           
          <p>Thank you for choosing Saywa Limo. If you have any questions or need assistance, feel free to contact our support team at <a href="mailto:${process.env.CONTACT_EMAIL}">${process.env.CONTACT_EMAIL}</a>.</p>
          <p>Best regards,<br>Saywa Limo</p>
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
  </table>`;

      const emailData = {
        from: "bookings@fluffnfolde.com",
        to: req.body.email,
        subject: "Account Created",
        text: `<div>${mailData}<div>`,
      };

      handleSendEmail(emailData);
    }
    const userData = await Customers.find(matchQuery);

    return res.status(200).json(userData);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
});

const checkExistonDB = asyncHandler(async (req, res) => {
  const query = { email: req.body.email };
  try {
    const checkExist = await Customers.findOne(query);
    if (checkExist) {
      return res.status(200).json("Exist");
    } else {
      return res.status(200).json("NotExist");
    }
  } catch (error) {
    return res.status(500).json({ message: "internal Server Error" });
  }
});

const updateUserPhone = asyncHandler(async (req, res) => {
  const query = {
    user_id: req.body.uid,
  };
  const data = {
    $set: {
      contact_no: req.body.phone,
    },
  };

  const getStripeID = await Customers.find(query);

  await stripe.customers.update(getStripeID[0].stripeId, {
    phone: req.body.phone,
    metadata: {
      key: "updated_value",
    },
  });

  await Customers.updateOne(query, data);
  Customers.find(query).then((result) => {
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

    //   Mail Data
    const mailOptions = {
      from: `"Saywa" <${process.env.NO_REPLY}>`,
      to: req.body.email,
      subject: "Saywa Limo Contact Number reset",
      html: `<div style="padding: 20px;">
    <p style="text-align: left;">Dear user,</p>
    <p style="text-align: left;">We hope this message finds you well. Thank you for choosing Saywa Limo for your upcoming trip. We are delighted to inform you that the your contact number has been updated.</p>
    <p>Updatd Contact NUmber : ${req.body.phon}</p>
    <p>Should you have any specific requirements or if there are changes to your travel plans, please feel free to contact our customer support at [Customer Support Email/Phone].</p>
    <p>Your satisfaction and safety are our top priorities, and we assure you that our driver will provide you with a comfortable and secure journey.</p>
    <p>Thank you for choosing Saywa Limo. We look forward to serving you and ensuring a seamless travel experience.</p>
    <p>Best regards,</br>Saywa Limo Support Team</p>
  </div>`,
    };

    //   Send Action
    transporter.sendMail(mailOptions);
    return res.status(200).json({
      data: result,
    });
  });
});
const newSignature = asyncHandler(async (req, res) => {
  const query = {
    user_id: req.body.customer_id,
  };
  const data = {
    signature: req.body.signature,
    documentStatus: "",
  };
  await Customers.findOneAndUpdate(query, data);
  Customers.find(query).then((result) => {
    return res.status(200).json({
      data: result,
    });
  });
});
const findCustomer = asyncHandler(async (req, res) => {
  const query = {
    user_id: req.body.customer_id,
  };

  Customers.find(query).then((result) => {
    return res.status(200).json(result);
  });
});

const updateCustomer = async (req, res) => {
  try {
    const query = {
      _id: req.body.id,
    };

    const update = {
      $set: {
        fullName: req.body.name,
        email: req.body.email,
        contact_no: req.body.contactNo,
      },
    };

    // const getStripeID = await Customers.find(query);

    // await stripe.customers.update(getStripeID[0].stripeId, {
    //   phone: req.body.contactNo,
    //   metadata: {
    //     key: "updated_value",
    //   },
    // });

    const result = await Customers.updateOne(query, update);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    const updatedData = await Customers.find();

    return res
      .status(200)
      .json({ message: "Customer updated successfully", data: updatedData });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateCustomerModal = async (req, res) => {
  try {
    const query = {
      user_id: req.body.cid,
    };

    const update = {
      $set: {
        fullName: req.body.name,
        email: req.body.email,
        contact_no: req.body.contactNo,
        addressLine1: req.body.addressLine1,
        addressLine2: req.body.addressLine2,
        addressLine3: req.body.addressLine3,
        zipCode: req.body.zipCode,
      },
    };

    const result = await Customers.updateOne(query, update);

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ message: "Customer updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const adminCustomerList = asyncHandler(async (req, res) => {
  const pageNumber = req.body.page;
  const pageSize = req.body.per_page;
  const skip = (pageNumber - 1) * pageSize;

  const regex = new RegExp(req.body.searchKey, "i");

  if (req.body.searchKey == undefined || req.body.searchKey == "") {
    const total = await Customers.find({ customerStatus: "active" });
    await Customers.find({ customerStatus: "active" })
      .skip(skip)
      .limit(pageSize)
      .then((response) => {
        return res.status(200).json({
          data: response,
          total: total.length,
        });
      });
  } else {
    const total = await Customers.find({
      $or: [{ fullName: regex }, { contact_no: regex }],
    });
    await Customers.find({
      $or: [{ fullName: regex }, { contact_no: regex }],
    })
      .skip(skip)
      .limit(pageSize)
      .then((response) => {
        return res.status(200).json({
          data: response,
          total: total.length,
        });
      });
  }
});

const liveSearch = asyncHandler(async (req, res) => {
  try {
    const regex = new RegExp(req.body.searchKey, "i");

    const data = await Customers.find({
      $or: [{ fullName: regex }, { contact_no: regex }],
    });

    const dataCount = await Customers.countDocuments({
      $or: [{ fullName: regex }, { contact_no: regex }],
    });

    const response = {
      data: data,
      total: dataCount,
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json(error);
  }
});

const liveCustomersCount = asyncHandler(async (req, res) => {
  const count = await Customers.find();
  return res.status(200).json({ count: count.length });
});

const deleteUser = async (req, res) => {
  try {
    const query = {
      _id: req.body.id,
    };
    const data = {
      customerStatus: "inactive",
    };
    await Customers.updateOne(query, data);
    const result = await Customers.find().limit(10);
    const datac = {
      data: result,
      total: 10,
    };
    return res.status(200).json(datac);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

const walletBalance = async (req, res) => {
  try {
    const { cust_id } = req.body;
    console.log("Customer ID:", cust_id);
    if (!cust_id) {
      return res.status(400).json({ message: "Customer ID is required" });
    }


    const result = await Customers.findOne({ user_id: cust_id });

    if (!result) {
      return res.status(404).json({ message: "Customer not found" });
    }

    return res.status(200).json({ wallet_balance: result.wallet_balance || 0 });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deductWallet = async (req, res) => {
  try {
    const { cust_id, amount } = req.body;
    console.log("Deduct Wallet Request - Customer ID:", cust_id, "Amount:", amount);
    
    // Validate input: both customer ID and amount are required
    if (!cust_id || amount === undefined) {
      return res.status(400).json({ message: "Customer ID and amount are required" });
    }
    
    // If necessary, validate the format of cust_id
    // if (!mongoose.Types.ObjectId.isValid(cust_id)) {
    //   return res.status(400).json({ message: "Invalid Customer ID format" });
    // }

    // Query the database to find the customer by their user_id (assuming it's stored as a string)
    const customer = await Customers.findOne({ user_id: cust_id });
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Deduct the amount from the wallet_balance
    // (If wallet_balance is undefined, default it to 0)
    customer.wallet_balance = Math.max(customer.wallet_balance - amount, 0);
    
    // Save the updated customer document
    await customer.save();
    
    // Return the updated wallet balance
    return res.status(200).json({ wallet_balance: customer.wallet_balance });
  } catch (error) {
    console.error("Error deducting wallet balance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// router.post("/deduct-wallet", async (req, res) => {
//   try {
//     const { cust_id, amount } = req.body; // amount to deduct
//     if (!cust_id || amount === undefined) {
//       return res.status(400).json({ message: "Customer ID and amount are required" });
//     }

//     // Find the customer using user_id (assuming it's stored as a string)
//     const customer = await Customers.findOne({ user_id: cust_id });
//     if (!customer) {
//       return res.status(404).json({ message: "Customer not found" });
//     }

//     // Prevent wallet_balance from going negative.
//     // Option 1: Deduct only if the current balance is enough.
//     // if (customer.wallet_balance < amount) {
//     //   return res.status(400).json({ message: "Insufficient wallet balance" });
//     // }

//     // Option 2: Subtract the amount and set balance to 0 if it would go negative.
//     customer.wallet_balance = Math.max(customer.wallet_balance - amount, 0);

//     await customer.save();

//     return res.status(200).json({ wallet_balance: customer.wallet_balance });
//   } catch (error) {
//     console.error("Error deducting wallet balance:", error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// });



module.exports = {
  signUpWithEmail,
  signUpWithGoogle,
  updateUserPhone,
  newSignature,
  findCustomer,
  updateCustomer,
  adminCustomerList,
  liveSearch,
  liveCustomersCount,
  updateCustomerModal,
  checkExistonDB,
  adminSignUpWithEmail,
  deleteUser,
  walletBalance,
  deductWallet,
};
