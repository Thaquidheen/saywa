const mongoose = require("mongoose");

const TaxSchema = new mongoose.Schema({
  value: {
    type: Number,
    default: 9,
    required: true,
  },
  created_at: {
    type: Date,
    default: new Date(),
    required: true,
  },
});

module.exports = mongoose.model("tax", TaxSchema);
