const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const {
  PaymentSuccessMailTemplate,
} = require("../email_templates/PaymentSuccessMailTemplate");
const {
  handleSendEmailAttachment,
} = require("../gmail_controller/GmailController");

const sendOrderSuccessMail = async (
  email,
  customer,
  tripData,
  custData,
  vehicleData
) => {
  try {
    await generateInvoice(customer, tripData, custData);

    const mailOptions = {
      from: `"Saywa" <${process.env.CONTACT_EMAIL}>`,
      to: email,
      subject: "New booking",
      text: PaymentSuccessMailTemplate(
        customer,
        tripData,
        custData,
        email,
        vehicleData
      ),

      attachments: [
        {
          filename: "invoice.pdf",
          path: __dirname + "/invoice.pdf",
          contentType: "application/pdf",
        },
      ],
    };
    handleSendEmailAttachment(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

const generateInvoice = async (customer, tripData, custData) => {
  const doc = new PDFDocument();
  const pdfPath = path.join(__dirname, "invoice.pdf");

  doc.pipe(fs.createWriteStream(pdfPath));
  let nightCharge = false;
  let TimeAndAMPMData = customer[0].scheduledTime.split(" ");

  if (TimeAndAMPMData.length > 0) {
    timeData = TimeAndAMPMData[0].split(":");
    if (parseInt(timeData[0]) == 10 || parseInt(timeData[0]) == 11) {
      if (TimeAndAMPMData[1] == "PM") {
        nightCharge = true;
      } else {
        nightCharge = false;
      }
    } else if (parseInt(timeData[0]) == 12 || 1 || 2 || 3 || 4 || 5) {
      if (
        parseInt(
          timeData[0] == 5 && timeData[1] <= 45 && TimeAndAMPMData[1] == "AM"
        )
      ) {
        nightCharge = true;
      } else if (TimeAndAMPMData[1] == "AM") {
        nightCharge = true;
      } else {
        nightCharge = false;
      }
    }
  }

  // doc.pipe(fs.createWriteStream(filePath));
  const logoimage = path.join(__dirname, "logo.png");
  doc
    .fillColor("#444444")
    .image(`${logoimage}`, 55, 57, { width: 100 })
    .moveDown();
  doc
    .fillColor("#444444")
    .fontSize(20)
    // .text("Saywa", 55, 57)

    .fontSize(10)
    .text("3009 Bridgeport Way West", 55, 105)
    .text("Tacoma, WA 98466", 55, 118)
    .text("reservations@saywalimo.com", 55, 131)
    .text("877-206-0780", 55, 144)

    .fontSize(10)
    // .text("Seattle", 200, 105, { align: "right" })
    // .text("US", 200, 120, { align: "right" })
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
      formatDate(new Date(tripData[0].created_at)),
      150,
      customerInformationTop + 15
    )

    .text("Bill to:", 300, customerInformationTop)
    .font("Helvetica-Bold")
    .text(tripData[0].customerName, 350, customerInformationTop)
    .font("Helvetica")
    .text(custData[0].email, 350, customerInformationTop + 14)
    .text(custData[0].contact_no, 350, customerInformationTop + 28)

    .moveDown();

  const invoiceTableTop = 230;

  doc
    .font("Helvetica-Bold")
    .text("#", 50, invoiceTableTop + 60)
    // .text("Quantity", 75, invoiceTableTop + 60)
    .text("Description", 70, invoiceTableTop + 60)
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
    .text("1", 50, invoiceTableTop + 90)
    // .text("1", 95, invoiceTableTop + 90)
    .text(onewayTrip, 70, invoiceTableTop + 90, { width: 420, align: "left" })
    .text("$" + parseInt(customer[0]?.totalAmount), 300, invoiceTableTop + 90, {
      align: "right",
    });
  generateHr(doc, invoiceTableTop + 180);
  const BaseRatePosition = invoiceTableTop + 200;
  var discountRate = 0;

  var tax = 0;
  var discount = customer[0]?.totalAmount;
  var grandTotal = customer[0]?.totalAmount;
  var grandTotal = grandTotal - discount;

  const discountPrice = customer[0]?.discount
    ? parseInt(customer[0]?.discount).toFixed(2)
    : 0;

  generateTableRow(
    doc,
    BaseRatePosition,
    "",
    "",
    "Sub Total",
    "",
    `$ ${discountPrice}`
  );

  const taxPosition = BaseRatePosition + 20;

  generateTableRow(doc, taxPosition, "", "", "Discount", "", `$ ${grandTotal}`);

  generateTableRow(
    doc,
    taxPosition + 20,
    "",
    "",
    "Tax",
    "",
    `$ ${customer[0]?.tax}`
  );
  const primeTimePosition = taxPosition + 40;
  generateTableRow(
    doc,
    primeTimePosition,
    "",
    "",
    "Discount",
    "",
    `$ ${discount}`
  );

  const duePosition = primeTimePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Grand Total",
    "",
    `$ ${customer[0]?.totalAmount}`
  );
  doc.font("Helvetica");
  doc.moveDown(1);
  doc.text("Best regards,", 50);
  doc.moveDown();
  doc.text("Saywa Team", 50);
  doc.moveDown(2);
  doc.font("Helvetica-Bold");
  doc.text("Terms and Conditions");
  doc.font("Helvetica");
  doc.moveDown();
  doc.text(
    "If weather/road conditions become harsh and hazardous. An extra surcharge will be billed to the client depending on the extent of conditions.For airport pickups, we provide an hour standby.",
    50
  );
  doc.moveDown(1);
  doc.text(
    "For regular reservations, a 30 minute standby is provided, afterwards standby will be charged. $95 for Sedan. $115 for SUV. Cancellations made within 3 hours of the reservation are charged full fare. No shows is the same concept with no refund. The driver has the right to decline a reservation if the client hasn't shown up for 1 hour since the scheduled pickup time. Changes made within 3 hours of the reservation will be charged as standby. By paying this invoice, the client agrees to these terms and conditions.",
    50
  );

  doc.end();

  const fileName = "invoice.pdf";
};

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    // .text(item, 50, y, { width: 500 })
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    // .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return +month + "/" + day + "/" + year;
}

module.exports = { sendOrderSuccessMail };
