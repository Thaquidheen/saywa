const PaymentLinkMailTemplate = (
  fullName,
  totalAmount,
  tripNo,
  source,
  destination,
  _id,
  client_secret
) => {
  return `
     <table
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
                                          Trip Created by Admin
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
                                                   <div>
<p style="text-align: left;">Dear ${fullName},</p>
    <p style="text-align: left;">Your documents have been verified. We will assign a driver and send you another email.</p>
    <p style="text-align: left;">You have a pending payment of <strong>$${parseFloat(
      totalAmount
    )} </strong>for the trip number <strong>${tripNo}</strong>. To complete the payment, please click the link below:</p>
        <table style="border-collapse: collapse; width: 100%;" border="1">
      <thead>
        <tr>
          <th style="width: 20%;">Order No</th>
          <th style="width: 20%;">Pick up location</th>
          <th style="width: 20%;">Drop off location</th>
          <th style="width: 20%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="width: 20%;">${tripNo}</td>
          <td style="width: 20%;">${source}</td>
          <td style="width: 20%;">${destination}</td>
          <td style="width: 20%;">$${parseFloat(totalAmount)}</td>
        </tr>
      </tbody>
    </table>
    <p  style="padding-top:16px"><a style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;" href="${
      process.env.CLIENT_URL
    }/payment/${client_secret}/${_id}">Pay Now</a></p>
     
    <p>If you have any questions or concerns, please don't hesitate to contact us at ${
      process.env.CONTACT_EMAIL
    }.</p>
    <p>Thank you for your business!</p>
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
  `;
};

module.exports = { PaymentLinkMailTemplate };
