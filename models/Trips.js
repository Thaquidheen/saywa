const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  no: {
    type: Number,
    required: true,
  },
  tripNo: {
    type: String,
    required: true,
  },
  invoiceId: {
    type: String,
    required: false,
  },
  source: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: false,
  },
  routeNo: {
    type: String,
    required: false,
  },
  customerId: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: false,
  },
  vehicleId: {
    type: mongoose.Schema.ObjectId,
    required: true,
  },
  rideType: {
    type: String,
    enum: ["oneway-trip", "round-trip", "hourly-trip", "package-trip"],
    required: true,
  },
  totalHours: {
    type: String,
    required: false,
  },

  driverId: {
    type: mongoose.Schema.ObjectId,
    required: false,
  },
  scheduledDate: {
    type: String,
    required: true,
  },

  scheduledTime: {
    type: String,
    required: false,
  },
  shortDescription: {
    type: String,
    required: false,
  },
  driverId: {
    type: mongoose.Schema.ObjectId,
    required: false,
  },
  tripStatus: {
    type: String,
    required: false,
  },
  totalAmount: {
    type: String,
    required: false,
  },
  totalKms: {
    type: String,
    required: false,
  },
  meetAndGreet: {
    type: String,
    required: false,
  },
  tripOccasion: {
    type: String,
    required: false,
  },
  tripOccasionDetails: {
    type: String,
    required: false,
  },
  stops: {
    type: Array,
    required: false,
  },
  paymentStatus: {
    type: String,
    required: false,
  },
  paymentId: {
    type: String,
    required: false,
  },
  paymentReference: {
    type: String,
    required: false,
  },
  paymentMode: {
    type: String,
    required: false,
  },
  noOfPassengers: {
    type: String,
    required: false,
  },
  noOfBags: {
    type: String,
    required: false,
  },
  signature: {
    type: String,
    required: false,
  },
  documents: {
    type: Array,
    required: false,
  },
  bagType: {
    type: String,
    required: false,
  },
  flightInformation: {
    type: String,
    required: false,
  },
  needCarSeat: {
    type: String,
    required: false,
  },
  seatCount: {
    type: Array,
    required: false,
  },
  carryOnBagsCount: {
    type: String,
    required: false,
  },
  checkedBagCount: {
    type: String,
    required: false,
  },
  additionalInfo: {
    type: String,
    required: false,
  },
  gratuiryTypeCash: {
    type: String,
    required: false,
  },
  gratuityAmount: {
    type: String,
    required: false,
  },
  checkInBags: {
    type: String,
    required: false,
  },
  carryBags: {
    type: String,
    required: false,
  },
  wheelChair: {
    type: String,
    required: false,
  },
  tripSource: {
    type: String,
    required: false,
  },
  nightCharge: {
    type: String,
    required: false,
  },
  discount: {
    type: String,
    required: false,
  },
  walletAmount: {
    type: Number,
    required: false,
  },
  referalCode: {
    type: String,
    required: false,
  },
  returnDate: {
    type: String,
    required: false,
  },
  returnTime: {
    type: String,
    required: false,
  },
  tax: {
    type: String,
    required: false,
  },
  additionalSeats: [
    {
      type: { type: String, required: true }, // E.g., "Infant", "Toddler", etc.
      count: { type: Number, required: true },
    },
  ],
  needWheelChair: {
    type: String,
    enum: ["Yes", "No"],
    default: "No",
  },
  baseRate: {
    type: String,
    required: false,
  },
  packageName: {
    type: String,
    default: "",
    required: false,
  },
  returnMeetAndGreet: { type: String, default: "" },
  returnGratuity: { type: String, default: "" },
  returnSeats: { type: Array, default: [] },
  returnAdditionalInfo: { type: String, default: "" },
  returnGratuityAmount: { type: Number, default: 0 },
  returnTotalKms: { type: String, default: "0" },
  returnBagType: { type: String, default: "" },
  returnCarryOnBagsCount: { type: String, default: "0" },
  returnCheckedBagCount: { type: String, default: "0" },
  returnNeedWheelChair: { type: String, default: "No" },
  returnDiscount: { type: String, default: "0" },
  created_at: {
    type: Date,
    default: new Date(),
    required: true,
  },
});

module.exports = mongoose.model("trips", tripSchema);
