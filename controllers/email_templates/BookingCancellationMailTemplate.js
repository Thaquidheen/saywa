const BookingCancellationMailTemplate = (userName) => {
  return `<table
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
                                      Trip Canceled
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
                                                Dear ${userName}
                                              </p>
                                              <p>
                                              Warm greetings from Saywa!</p>
                                              <p style="color: #666666">
                                                We are writing to confirm the receipt and processing of your request to cancel your booking. Your cancellation has been successfully processed, and you can view the updated status in your account. Should you need further assistance or have any questions, our dedicated customer support team is ready to assist you promptly.
                                              </p>

                                              <!-- Add specific details or additional information here -->

                                              <p style="color: #666666">
                                              For inquiries or concerns, please reach out to us at ${process.env.CONTACT_EMAIL}.
                                             
                                              </p>

                                              <p style="color: #666666">
                                                Thank you for choosing Saywa!

                                              </p>

                                              <p style="color: #666666">
                                                Best regards,<br /><strong
                                                  >Saywa</strong
                                                >
                                              </p>
                                              <br />
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
};

module.exports = { BookingCancellationMailTemplate };
