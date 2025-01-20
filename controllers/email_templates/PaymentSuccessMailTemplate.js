const PaymentSuccessMailTemplate = (
  customer,
  tripData,
  custData,
  email,
  vehicleData
) => {
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
                                      New Trip
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
                                                  Dear ${customer[0].customerName}
                                              </p>
                                              <p style="text-align:justify">Thank you for choosing Saywa for your recent ride! We hope you had a pleasant experience.
    </p>
                                              <p style="text-align:justify">Your feedback is invaluable to us in our efforts to continually improve our service. Did we meet your expectations? Please share any suggestions on how we can enhance your experience next time.
    </p>
                                              <p style="text-align:justify">
                                               Your ride has been charged to the payment method selected during booking, so no further action is required from you. Attached to this email, you will find a copy of your invoice for your reference.

                                              </p>
                                             
                                              <p>
                                              	<table style="width:100%">
                                                  <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Booking Number :
                                                    <td style="text-align:start; padding:10px">${tripData[0].tripNo}
                                                  </tr> 
                                                  <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Date and time :
                                                    <td style="text-align:start; padding:10px">${tripData[0].scheduledDate} ${tripData[0].scheduledTime}
                                                  </tr>
                                                  <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">From :
                                                    <td style="text-align:start; padding:10px">${tripData[0].source}
                                                  </tr>
                                                  <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">To :
                                                    <td style="text-align:start; padding:10px">${tripData[0].destination}
                                                  </tr>
                                                  <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Distance :
                                                    <td style="text-align:start; padding:10px">${tripData[0].totalKms} Mile(s)
                                                  </tr>
                                                   <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Price :
                                                    <td style="text-align:start; padding:10px">$ ${tripData[0].totalAmount}
                                                  </tr>
                                                   <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Vehicle :
                                                    <td style="text-align:start; padding:10px">${vehicleData[0]?.vehicleName}
                                                  </tr>
                                                   
                                                     <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Mobile :
                                                    <td style="text-align:start; padding:10px">${custData[0].contact_no}
                                                  </tr>
                                                   <tr style="background:#f0f0f0 ">
                                                    <td style="text-align:start; padding:10px">Email :
                                                    <td style="text-align:start; padding:10px">${email}
                                                  </tr>
                                              </table>
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
   </table>`;
};

module.exports = { PaymentSuccessMailTemplate };
